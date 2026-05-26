from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, create_model
import pandas as pd
import joblib
import json
import os
import io

app = FastAPI(title="EduPredict Analytics API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = '../models/'
EXPORTS_DIR = '../exports/'

# Load Model
model = None
train_columns = []

@app.on_event("startup")
async def load_ml_model():
    global model, train_columns
    model_path = os.path.join(MODELS_DIR, 'best_model.joblib')
    cols_path = os.path.join(MODELS_DIR, 'train_columns.json')
    if os.path.exists(model_path):
        model = joblib.load(model_path)
    if os.path.exists(cols_path):
        with open(cols_path, 'r') as f:
            train_columns = json.load(f).get('columns', [])

# Since there are ~30 features, we use a flexible dictionary for single predictions
class PredictionRequest(BaseModel):
    features: dict

class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    confidence_scores: dict
    explanation: list = []

@app.get("/")
def root():
    return {"message": "EduPredict Analytics API is running"}

@app.post("/api/predict/single", response_model=PredictionResponse)
def predict_single(req: PredictionRequest):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Define categorical and numeric columns (based on training data)
    categorical_cols = {'school', 'sex', 'address', 'famsize', 'Pstatus', 'Medu', 'Fedu', 
                        'Mjob', 'Fjob', 'reason', 'guardian', 'schoolsup', 'famsup', 
                        'paid', 'activities', 'nursery', 'higher', 'internet', 'romantic'}
    numeric_cols = {'age', 'traveltime', 'studytime', 'failures', 'famrel', 'freetime', 
                   'goout', 'Dalc', 'Walc', 'health', 'absences', 'G1', 'G2'}
    
    # Build feature dict with defaults for missing values
    features = {}
    for col in train_columns:
        if col in req.features:
            features[col] = req.features[col]
        elif col in categorical_cols:
            features[col] = 'unknown'  # Default for categorical
        elif col in numeric_cols:
            features[col] = 0  # Default for numeric
        else:
            features[col] = 0
    
    # Create DataFrame with all required columns
    df = pd.DataFrame([features])
    
    # Reorder columns to match training
    df = df[train_columns]
    
    try:
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        classes = model.classes_
        
        prob_dict = {str(c): float(p) for c, p in zip(classes, probabilities)}
        max_prob = max(prob_dict.values())
        
        # Explainability (simple mock using global feature importance if tree-based, real SHAP would go here)
        explanation = []
        try:
            with open(os.path.join(EXPORTS_DIR, 'feature_importance.json'), 'r') as f:
                importance_data = json.load(f)
                # Pick top 3 features and show their values
                for imp in importance_data[:3]:
                    feat_name = imp['Feature']
                    # feat_name might be one-hot encoded like 'sex_F', so we simplify matching
                    for req_k, req_v in req.features.items():
                        if req_k in feat_name:
                            explanation.append(f"{req_k} ({req_v}) is a key factor.")
        except Exception:
            pass

        return PredictionResponse(
            prediction=str(prediction),
            probability=max_prob,
            confidence_scores=prob_dict,
            explanation=list(set(explanation))
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    try:
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content), sep=';' if b';' in content else ',')
        
        # Validate columns
        missing_cols = [c for c in train_columns if c not in df.columns]
        if missing_cols:
             raise HTTPException(status_code=400, detail=f"Missing columns: {missing_cols}")
             
        df_pred = df[train_columns]
        predictions = model.predict(df_pred)
        probabilities = model.predict_proba(df_pred)
        
        results = []
        for i in range(len(predictions)):
            prob_dict = {str(c): float(p) for c, p in zip(model.classes_, probabilities[i])}
            max_prob = max(prob_dict.values())
            res = {
                "id": i + 1,
                "prediction": str(predictions[i]),
                "confidence": round(max_prob, 4)
            }
            results.append(res)
            
        return {"batch_results": results}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/analytics/metrics")
def get_metrics():
    try:
        with open(os.path.join(EXPORTS_DIR, 'model_metrics.json'), 'r') as f:
            return json.load(f)
    except Exception:
        return []

@app.get("/api/analytics/stats")
def get_stats():
    try:
        with open(os.path.join(EXPORTS_DIR, 'dataset_stats.json'), 'r') as f:
            return json.load(f)
    except Exception:
        return {}
