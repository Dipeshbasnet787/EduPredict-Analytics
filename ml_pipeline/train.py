import pandas as pd
import numpy as np
import os
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

# Constants
DATA_PATH = '../datasets/student-mat.csv'
MODELS_DIR = '../models/'
EXPORTS_DIR = '../exports/'

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)

def load_data():
    df = pd.read_csv(DATA_PATH, sep=';')
    return df

def categorize_risk(g3):
    if g3 <= 9:
        return 'High Risk'
    elif g3 <= 14:
        return 'Medium Risk'
    else:
        return 'Low Risk'

def preprocess_data(df):
    # Target variable
    df['Risk'] = df['G3'].apply(categorize_risk)
    
    # Optional: we can drop G1, G2, G3 for strict prediction on demographics/habits, 
    # but the prompt implies a general student performance model. Usually G1/G2 are too predictive. 
    # Let's keep them but maybe analyze importance. Actually, if it's "early warning", dropping G2/G3 is better.
    # We will just drop G3 from features.
    y = df['Risk']
    
    # We map Target to numeric for ROC AUC: High=2, Medium=1, Low=0 (Ordinal context, but we use one-hot for OVR ROC)
    # Actually, scikit-learn metrics handle string labels if we provide them, or we can LabelEncode.
    
    X = df.drop(columns=['G3', 'Risk'])
    
    # Identify numerical and categorical columns
    categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
    numeric_cols = X.select_dtypes(exclude=['object']).columns.tolist()
    
    return X, y, categorical_cols, numeric_cols

def create_pipeline(classifier, categorical_cols, numeric_cols):
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])
    
    clf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', classifier)
    ])
    
    return clf_pipeline

def evaluate_model(name, model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)
    
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
    roc_auc = roc_auc_score(y_test, y_proba, multi_class='ovr')
    
    print(f"--- {name} ---")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    print(f"ROC-AUC: {roc_auc:.4f}\n")
    
    return {
        'name': name,
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'roc_auc': roc_auc
    }, y_pred

def plot_confusion_matrix(y_true, y_pred, model_name, labels):
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=labels, yticklabels=labels)
    plt.title(f'Confusion Matrix: {model_name}')
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.tight_layout()
    plt.savefig(f"{EXPORTS_DIR}/cm_{model_name.replace(' ', '_')}.png", dpi=300)
    plt.close()

def extract_feature_importance(model, categorical_cols, numeric_cols):
    preprocessor = model.named_steps['preprocessor']
    classifier = model.named_steps['classifier']
    
    if hasattr(classifier, 'feature_importances_'):
        importances = classifier.feature_importances_
        
        cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
        cat_feature_names = cat_encoder.get_feature_names_out(categorical_cols)
        
        feature_names = numeric_cols + list(cat_feature_names)
        
        importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
        importance_df = importance_df.sort_values(by='Importance', ascending=False)
        
        # Plot top 20
        plt.figure(figsize=(10, 8))
        sns.barplot(x='Importance', y='Feature', data=importance_df.head(20), palette='viridis')
        plt.title('Top 20 Feature Importances')
        plt.tight_layout()
        plt.savefig(f"{EXPORTS_DIR}/feature_importance.png", dpi=300)
        plt.close()
        
        return importance_df.head(20).to_dict('records')
    return None

def main():
    print("Loading data...")
    df = load_data()
    
    print("Preprocessing...")
    X, y, categorical_cols, numeric_cols = preprocess_data(df)
    
    # Save dataset stats for frontend
    stats = {
        'total_students': len(df),
        'risk_distribution': y.value_counts().to_dict(),
        'average_G3': float(df['G3'].mean()),
        'attendance_avg': float(df['absences'].mean())
    }
    with open(f"{EXPORTS_DIR}/dataset_stats.json", 'w') as f:
        json.dump(stats, f, indent=4)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, multi_class='multinomial', random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42, max_depth=5),
        "Random Forest": RandomForestClassifier(random_state=42, n_estimators=100, max_depth=10)
    }
    
    results = []
    best_model_name = ""
    best_model = None
    best_f1 = 0
    labels = ['High Risk', 'Medium Risk', 'Low Risk']
    
    for name, clf in models.items():
        print(f"Training {name}...")
        pipeline = create_pipeline(clf, categorical_cols, numeric_cols)
        pipeline.fit(X_train, y_train)
        
        metrics, y_pred = evaluate_model(name, pipeline, X_test, y_test)
        results.append(metrics)
        plot_confusion_matrix(y_test, y_pred, name, labels)
        
        if metrics['f1'] > best_f1:
            best_f1 = metrics['f1']
            best_model_name = name
            best_model = pipeline
            
    print(f"\nBest Model: {best_model_name} (F1: {best_f1:.4f})")
    
    # Save results
    with open(f"{EXPORTS_DIR}/model_metrics.json", 'w') as f:
        json.dump(results, f, indent=4)
        
    # Feature Importance (for Random Forest or Decision Tree)
    importance_data = extract_feature_importance(best_model, categorical_cols, numeric_cols)
    if importance_data:
        with open(f"{EXPORTS_DIR}/feature_importance.json", 'w') as f:
            json.dump(importance_data, f, indent=4)
            
    # Save the best model
    joblib.dump(best_model, f"{MODELS_DIR}/best_model.joblib")
    
    # Also save train columns for backend validation
    with open(f"{MODELS_DIR}/train_columns.json", 'w') as f:
        json.dump({'columns': X.columns.tolist()}, f, indent=4)
        
    print("Pipeline complete. Model and artifacts saved.")

if __name__ == '__main__':
    main()
