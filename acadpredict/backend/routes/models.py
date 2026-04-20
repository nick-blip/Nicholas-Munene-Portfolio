import io, json
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import Optional
from auth_utils import verify_token
from models.predictor import train_all, predict_student, predict_batch, get_metrics, models_ready, FEATURES
from data.generator import generate_students
from database import get_db

router = APIRouter()

class StudentFeatures(BaseModel):
    attendance_rate: float
    missed_classes: int
    assignment_avg: float
    test_avg: float
    prior_gpa: float
    sei: float
    scholarship: int
    part_time_hours: float
    teacher_score: float
    participation: float
    student_id: Optional[str] = None
    name: Optional[str] = None

@router.post("/train")
def train_models(use_synthetic: bool = True, username: str = Depends(verify_token)):
    try:
        if use_synthetic:
            df = generate_students(2000)
        else:
            conn = get_db()
            rows = conn.execute("SELECT * FROM students").fetchall()
            conn.close()
            if len(rows) < 50:
                raise HTTPException(status_code=400, detail="Need at least 50 student records to train. Use synthetic data or upload more records.")
            df = pd.DataFrame([dict(r) for r in rows])
        metrics = train_all(df)
        return {"message": "Models trained successfully", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def model_status(username: str = Depends(verify_token)):
    ready = models_ready()
    metrics = get_metrics() if ready else None
    return {"ready": ready, "metrics": metrics}

@router.post("/predict/student")
def predict_one(features: StudentFeatures, username: str = Depends(verify_token)):
    if not models_ready():
        raise HTTPException(status_code=400, detail="Models not trained yet. Go to Model Management and click Train.")
    feat_dict = features.model_dump(exclude={'student_id', 'name'})
    result = predict_student(feat_dict)
    # Save prediction
    conn = get_db()
    conn.execute("""INSERT INTO predictions
        (student_id, pass_fail, pass_confidence, grade, predicted_gpa, at_risk, risk_confidence)
        VALUES (?,?,?,?,?,?,?)""",
        (features.student_id, result['pass_fail']['prediction'], result['pass_fail']['confidence'],
         result['grade']['prediction'], result['gpa']['prediction'],
         result['at_risk']['prediction'], result['at_risk']['confidence']))
    conn.commit(); conn.close()
    return {"student_id": features.student_id, "name": features.name, **result}

@router.post("/predict/batch")
async def predict_csv(file: UploadFile = File(...), username: str = Depends(verify_token)):
    if not models_ready():
        raise HTTPException(status_code=400, detail="Models not trained yet.")
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files accepted.")
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode()))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")
    missing = [f for f in FEATURES if f not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"CSV missing columns: {missing}")
    try:
        results = predict_batch(df)
        return {"count": len(results), "predictions": results.to_dict(orient='records')}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics")
def model_metrics(username: str = Depends(verify_token)):
    m = get_metrics()
    if not m:
        raise HTTPException(status_code=404, detail="No metrics yet. Train models first.")
    return m

@router.get("/features")
def feature_list():
    return {"features": FEATURES}

@router.get("/sample-csv")
def sample_csv(username: str = Depends(verify_token)):
    df = generate_students(5)
    return {"columns": FEATURES, "sample": df[FEATURES + ['student_id']].head(5).to_dict(orient='records')}
