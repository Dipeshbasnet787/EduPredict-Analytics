# EduPredict Analytics

EduPredict Analytics is a dissertation-level educational machine learning platform that predicts student academic performance using ML models (Logistic Regression, Decision Tree, Random Forest) and visual analytics.

## Project Structure

- `frontend/`: Next.js web application built with Tailwind CSS, shadcn/ui, and Recharts.
- `backend/`: FastAPI server that loads the ML model and serves prediction endpoints.
- `ml_pipeline/`: Data processing, ML model training, and chart generation scripts.
- `datasets/`: Contains the UCI Student Performance dataset.
- `models/`: Saved `.joblib` models and preprocessors.
- `exports/`: Generated publication-quality graphs (ROC curves, confusion matrices, etc.) and metrics.

## How to Run Locally

You will need **two separate terminal windows** to run the backend and frontend simultaneously.

### 1. Start the FastAPI Backend
Open a new terminal at the project root (`/Users/bikrantpandit/Desktop/Work/Dipesh`) and run:
```bash
# Activate the Python virtual environment
source .venv/bin/activate

# Navigate to the backend directory
cd backend

# Start the server on port 8001
uvicorn main:app --port 8001 --reload
```
The backend API will now be running at `http://localhost:8001`.

### 2. Start the Next.js Frontend
Open a **second terminal** at the project root (`/Users/bikrantpandit/Desktop/Work/Dipesh`) and run:
```bash
# Navigate to the frontend directory
cd frontend

# Run the development server
npm run dev
```
The dashboard will now be accessible at `http://localhost:3000`.

## Re-running the ML Pipeline
If you want to re-train the models or re-generate the dataset and result charts, use the following commands from the project root:

```bash
# Activate the Python virtual environment
source .venv/bin/activate

cd ml_pipeline

# Train models and generate confusion matrices
python train.py

# Generate additional EDA and ROC curves
python generate_plots.py
```
