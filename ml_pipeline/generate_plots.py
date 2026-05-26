import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
from sklearn.metrics import roc_curve, auc, precision_recall_curve
from sklearn.model_selection import train_test_split
from train import preprocess_data, create_pipeline, categorize_risk
from sklearn.preprocessing import label_binarize
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

# Constants
DATA_PATH = '../datasets/student-mat.csv'
MODELS_DIR = '../models/'
EXPORTS_DIR = '../exports/'

# Ensure exports directory exists
os.makedirs(EXPORTS_DIR, exist_ok=True)

def generate_dataset_plots(df):
    print("Generating dataset plots...")
    
    # 1. Correlation Matrix Heatmap (Numeric features only)
    plt.figure(figsize=(12, 10))
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr()
    
    # Custom palette for SaaS look
    sns.heatmap(corr, annot=False, cmap='coolwarm', vmin=-1, vmax=1, center=0,
                square=True, linewidths=.5, cbar_kws={"shrink": .5})
    plt.title('Feature Correlation Matrix', fontsize=16)
    plt.tight_layout()
    plt.savefig(f"{EXPORTS_DIR}/correlation_matrix.png", dpi=300)
    plt.close()

    # 2. Distribution of Final Grades (G3)
    plt.figure(figsize=(10, 6))
    sns.histplot(df['G3'], bins=20, kde=True, color='#4f46e5', edgecolor='white')
    plt.title('Distribution of Final Grades (G3)', fontsize=14)
    plt.xlabel('Final Grade (0-20)')
    plt.ylabel('Number of Students')
    plt.axvline(x=9.5, color='#ef4444', linestyle='--', label='Pass/Fail Threshold')
    plt.legend()
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{EXPORTS_DIR}/g3_distribution.png", dpi=300)
    plt.close()

    # 3. Absences vs Risk Category
    plt.figure(figsize=(10, 6))
    df['Risk'] = df['G3'].apply(categorize_risk)
    sns.boxplot(x='Risk', y='absences', data=df, palette=['#ef4444', '#f59e0b', '#10b981'], order=['High Risk', 'Medium Risk', 'Low Risk'])
    plt.title('Student Absences by Risk Category', fontsize=14)
    plt.xlabel('Risk Category')
    plt.ylabel('Number of Absences')
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{EXPORTS_DIR}/absences_by_risk.png", dpi=300)
    plt.close()

    # 4. Study time vs Risk Category
    plt.figure(figsize=(10, 6))
    sns.countplot(x='studytime', hue='Risk', data=df, palette=['#ef4444', '#f59e0b', '#10b981'], hue_order=['High Risk', 'Medium Risk', 'Low Risk'])
    plt.title('Study Time Distribution by Risk', fontsize=14)
    plt.xlabel('Study Time (1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h)')
    plt.ylabel('Count')
    plt.legend(title='Risk Category')
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{EXPORTS_DIR}/studytime_by_risk.png", dpi=300)
    plt.close()

def generate_result_plots(df):
    print("Generating result plots (ROC)...")
    
    X, y, categorical_cols, numeric_cols = preprocess_data(df)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # We need to retrain models quickly just for the ROC plot if we didn't save all of them.
    # It's fast enough.
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, multi_class='multinomial', random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42, max_depth=5),
        "Random Forest": RandomForestClassifier(random_state=42, n_estimators=100, max_depth=10)
    }
    
    # Binarize labels for multi-class ROC
    classes = ['High Risk', 'Low Risk', 'Medium Risk']
    y_test_bin = label_binarize(y_test, classes=classes)
    n_classes = y_test_bin.shape[1]
    
    plt.figure(figsize=(10, 8))
    colors = ['#4f46e5', '#10b981', '#f59e0b']
    
    for (name, clf), color in zip(models.items(), colors):
        pipeline = create_pipeline(clf, categorical_cols, numeric_cols)
        pipeline.fit(X_train, y_train)
        
        y_score = pipeline.predict_proba(X_test)
        
        # Compute micro-average ROC curve and ROC area
        fpr, tpr, _ = roc_curve(y_test_bin.ravel(), y_score.ravel())
        roc_auc = auc(fpr, tpr)
        
        plt.plot(fpr, tpr, color=color, lw=2, label=f'{name} (area = {roc_auc:0.2f})')

    plt.plot([0, 1], [0, 1], 'k--', lw=2)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('Micro-Averaged ROC Curves by Model', fontsize=14)
    plt.legend(loc="lower right")
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(f"{EXPORTS_DIR}/roc_curves.png", dpi=300)
    plt.close()

if __name__ == "__main__":
    df = pd.read_csv(DATA_PATH, sep=';')
    generate_dataset_plots(df)
    generate_result_plots(df)
    print("Additional plots generated in the exports directory.")
