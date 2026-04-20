import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from auth_utils import verify_token
from database import get_db
from data.generator import generate_students
from models.predictor import FEATURES

router = APIRouter()

class StudentIn(BaseModel):
    student_id: Optional[str] = None
    name: Optional[str] = None
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

@router.get("/")
def list_students(limit: int = 100, username: str = Depends(verify_token)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM students ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/count")
def count_students(username: str = Depends(verify_token)):
    conn = get_db()
    n = conn.execute("SELECT COUNT(*) as c FROM students").fetchone()["c"]
    conn.close()
    return {"count": n}

@router.post("/")
def add_student(s: StudentIn, username: str = Depends(verify_token)):
    conn = get_db()
    conn.execute("""INSERT OR REPLACE INTO students
        (student_id,name,attendance_rate,missed_classes,assignment_avg,test_avg,
         prior_gpa,sei,scholarship,part_time_hours,teacher_score,participation)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
        (s.student_id, s.name, s.attendance_rate, s.missed_classes, s.assignment_avg,
         s.test_avg, s.prior_gpa, s.sei, s.scholarship, s.part_time_hours,
         s.teacher_score, s.participation))
    conn.commit(); conn.close()
    return {"message": "Student added"}

@router.delete("/{student_id}")
def delete_student(student_id: str, username: str = Depends(verify_token)):
    conn = get_db()
    conn.execute("DELETE FROM students WHERE student_id=?", (student_id,))
    conn.commit(); conn.close()
    return {"message": "Deleted"}

@router.post("/seed-synthetic")
def seed_synthetic(n: int = 200, username: str = Depends(verify_token)):
    df = generate_students(n)
    conn = get_db()
    for _, row in df.iterrows():
        conn.execute("""INSERT OR IGNORE INTO students
            (student_id,attendance_rate,missed_classes,assignment_avg,test_avg,
             prior_gpa,sei,scholarship,part_time_hours,teacher_score,participation)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (row.student_id, row.attendance_rate, row.missed_classes, row.assignment_avg,
             row.test_avg, row.prior_gpa, row.sei, row.scholarship, row.part_time_hours,
             row.teacher_score, row.participation))
    conn.commit(); conn.close()
    return {"message": f"Seeded {n} synthetic students"}

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), username: str = Depends(verify_token)):
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode()))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV: {e}")
    required = FEATURES
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")
    conn = get_db()
    added = 0
    for _, row in df.iterrows():
        sid = str(row.get('student_id', f'CSV_{added}'))
        conn.execute("""INSERT OR REPLACE INTO students
            (student_id,attendance_rate,missed_classes,assignment_avg,test_avg,
             prior_gpa,sei,scholarship,part_time_hours,teacher_score,participation)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (sid, row.attendance_rate, row.missed_classes, row.assignment_avg, row.test_avg,
             row.prior_gpa, row.sei, row.scholarship, row.part_time_hours,
             row.teacher_score, row.participation))
        added += 1
    conn.commit(); conn.close()
    return {"message": f"Uploaded {added} records"}

@router.get("/download-template")
def download_template(username: str = Depends(verify_token)):
    df = generate_students(3)[FEATURES + ['student_id']]
    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()),
                             media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=student_template.csv"})

@router.get("/predictions")
def get_predictions(limit: int = 100, username: str = Depends(verify_token)):
    conn = get_db()
    rows = conn.execute("SELECT * FROM predictions ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.get("/analytics")
def analytics(username: str = Depends(verify_token)):
    conn = get_db()
    total = conn.execute("SELECT COUNT(*) as c FROM predictions").fetchone()["c"]
    pass_count = conn.execute("SELECT COUNT(*) as c FROM predictions WHERE pass_fail=1").fetchone()["c"]
    risk_count = conn.execute("SELECT COUNT(*) as c FROM predictions WHERE at_risk=1").fetchone()["c"]
    avg_gpa = conn.execute("SELECT AVG(predicted_gpa) as a FROM predictions").fetchone()["a"]
    grade_dist = conn.execute("SELECT grade, COUNT(*) as c FROM predictions GROUP BY grade").fetchall()
    conn.close()
    return {
        "total_predictions": total,
        "pass_rate": round(pass_count / total * 100, 1) if total else 0,
        "at_risk_rate": round(risk_count / total * 100, 1) if total else 0,
        "avg_predicted_gpa": round(avg_gpa, 2) if avg_gpa else None,
        "grade_distribution": {r["grade"]: r["c"] for r in grade_dist},
    }
