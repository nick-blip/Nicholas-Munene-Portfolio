# AcadPredict — University Academic Achievement Prediction System

A full-stack ML app predicting student outcomes across 4 dimensions with 90%+ accuracy.

---

## Model performance (on 2,000 synthetic students)

| Model | Algorithm | Accuracy |
|-------|-----------|----------|
| Pass / Fail | Random Forest | **96.5%** |
| At-risk / Dropout | Random Forest | **99.7%** |
| Grade (A–F) | Gradient Boosting | **82.7%** |
| GPA prediction | Gradient Boosting | **R² 0.86** |

---

## Input features

| Feature | Range | Description |
|---------|-------|-------------|
| attendance_rate | 0.0–1.0 | Fraction of classes attended |
| missed_classes | 0–120 | Total classes missed |
| assignment_avg | 0–100 | Average assignment score |
| test_avg | 0–100 | Average test/exam score |
| prior_gpa | 0.0–4.0 | GPA from previous year |
| sei | 1–10 | Socioeconomic index |
| scholarship | 0 or 1 | Scholarship recipient |
| part_time_hours | 0–40 | Weekly hours of part-time work |
| teacher_score | 1–10 | Teacher assessment rating |
| participation | 1–10 | Class participation rating |

---

## Quick start (local)

```powershell
# Backend
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
copy .env.example .env
python main.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — login with `admin` / `admin123`

**First thing to do:** Go to Model Metrics → click Train Models

---

## Docker

```bash
cp .env.example .env
docker compose up --build -d
# → http://localhost
```

---

## App pages

| Page | What it does |
|------|-------------|
| Dashboard | Overview of predictions, model health, grade distribution |
| Predict Student | Single student prediction form with confidence rings |
| Batch Predict | Upload CSV, get predictions for all students, download results |
| Model Metrics | Train models, view accuracy, confusion matrices, feature importance |
| Data Manager | Seed synthetic data, upload CSVs, view/delete student records and prediction history |
| Settings | Change admin password |

---

## Replacing synthetic data with real data

1. Go to Data Manager → upload a CSV with the required columns
2. Go to Model Metrics → click Train Models (untick synthetic to train on your real data via the API)
3. Model will retrain on your actual student population

API endpoint: `POST /api/models/train?use_synthetic=false`

---

## API docs

Interactive docs at http://localhost:8000/docs
