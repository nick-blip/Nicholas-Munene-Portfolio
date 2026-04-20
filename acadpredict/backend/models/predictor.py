import os, joblib, json
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (accuracy_score, classification_report,
                             confusion_matrix, mean_absolute_error, r2_score)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

FEATURES = [
    'attendance_rate', 'missed_classes', 'assignment_avg', 'test_avg',
    'prior_gpa', 'sei', 'scholarship', 'part_time_hours',
    'teacher_score', 'participation'
]

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'saved_models')
os.makedirs(MODELS_DIR, exist_ok=True)

grade_encoder = LabelEncoder()
grade_encoder.classes_ = np.array(['A', 'B', 'C', 'D', 'F'])

def _path(name): return os.path.join(MODELS_DIR, f'{name}.joblib')
def _meta_path(): return os.path.join(MODELS_DIR, 'metrics.json')

def train_all(df: pd.DataFrame):
    X = df[FEATURES]
    metrics = {}

    # 1. Pass/Fail — Random Forest
    y_pf = df['pass_fail']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_pf, test_size=0.2, random_state=42, stratify=y_pf)
    pf_model = Pipeline([('scaler', StandardScaler()),
                         ('clf', RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, class_weight='balanced'))])
    pf_model.fit(X_tr, y_tr)
    pf_pred = pf_model.predict(X_te)
    pf_acc = accuracy_score(y_te, pf_pred)
    metrics['pass_fail'] = {
        'accuracy': round(pf_acc, 4),
        'report': classification_report(y_te, pf_pred, output_dict=True),
        'confusion_matrix': confusion_matrix(y_te, pf_pred).tolist(),
        'train_size': len(X_tr), 'test_size': len(X_te)
    }
    joblib.dump(pf_model, _path('pass_fail'))

    # 2. Grade A-F — Gradient Boosting
    y_gr = df['grade']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_gr, test_size=0.2, random_state=42, stratify=y_gr)
    gr_model = Pipeline([('scaler', StandardScaler()),
                         ('clf', GradientBoostingClassifier(n_estimators=200, max_depth=5, learning_rate=0.05, random_state=42))])
    gr_model.fit(X_tr, y_tr)
    gr_pred = gr_model.predict(X_te)
    gr_acc = accuracy_score(y_te, gr_pred)
    metrics['grade'] = {
        'accuracy': round(gr_acc, 4),
        'report': classification_report(y_te, gr_pred, output_dict=True),
        'confusion_matrix': confusion_matrix(y_te, gr_pred, labels=['A','B','C','D','F']).tolist(),
        'labels': ['A','B','C','D','F'],
        'train_size': len(X_tr), 'test_size': len(X_te)
    }
    joblib.dump(gr_model, _path('grade'))

    # 3. GPA regression (cohort performance proxy)
    y_gpa = df['final_gpa']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_gpa, test_size=0.2, random_state=42)
    gpa_model = Pipeline([('scaler', StandardScaler()),
                          ('reg', GradientBoostingRegressor(n_estimators=200, max_depth=5, learning_rate=0.05, random_state=42))])
    gpa_model.fit(X_tr, y_tr)
    gpa_pred = gpa_model.predict(X_te)
    metrics['gpa'] = {
        'mae': round(mean_absolute_error(y_te, gpa_pred), 4),
        'r2': round(r2_score(y_te, gpa_pred), 4),
        'train_size': len(X_tr), 'test_size': len(X_te)
    }
    joblib.dump(gpa_model, _path('gpa'))

    # 4. At-risk / dropout — Random Forest
    y_ar = df['at_risk']
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_ar, test_size=0.2, random_state=42, stratify=y_ar)
    ar_model = Pipeline([('scaler', StandardScaler()),
                         ('clf', RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42, class_weight='balanced'))])
    ar_model.fit(X_tr, y_tr)
    ar_pred = ar_model.predict(X_te)
    ar_acc = accuracy_score(y_te, ar_pred)
    metrics['at_risk'] = {
        'accuracy': round(ar_acc, 4),
        'report': classification_report(y_te, ar_pred, output_dict=True),
        'confusion_matrix': confusion_matrix(y_te, ar_pred).tolist(),
        'train_size': len(X_tr), 'test_size': len(X_te)
    }
    joblib.dump(ar_model, _path('at_risk'))

    # Feature importance from pass_fail model
    rf_clf = pf_model.named_steps['clf']
    importances = dict(zip(FEATURES, rf_clf.feature_importances_.round(4).tolist()))
    metrics['feature_importance'] = importances
    metrics['training_samples'] = len(df)

    with open(_meta_path(), 'w') as f:
        json.dump(metrics, f, indent=2)

    return metrics

def models_ready():
    return all(os.path.exists(_path(m)) for m in ['pass_fail', 'grade', 'gpa', 'at_risk'])

def get_metrics():
    if not os.path.exists(_meta_path()):
        return None
    with open(_meta_path()) as f:
        return json.load(f)

def predict_student(features: dict):
    if not models_ready():
        raise RuntimeError("Models not trained yet")
    row = pd.DataFrame([{f: features.get(f, 0) for f in FEATURES}])

    pf_model = joblib.load(_path('pass_fail'))
    gr_model = joblib.load(_path('grade'))
    gpa_model = joblib.load(_path('gpa'))
    ar_model = joblib.load(_path('at_risk'))

    pf = int(pf_model.predict(row)[0])
    pf_prob = float(pf_model.predict_proba(row)[0][1])

    grade = str(gr_model.predict(row)[0])
    grade_probs = dict(zip(gr_model.classes_, gr_model.predict_proba(row)[0].round(3).tolist()))

    gpa = float(round(gpa_model.predict(row)[0], 2))
    gpa = max(0.0, min(4.0, gpa))

    ar = int(ar_model.predict(row)[0])
    ar_prob = float(ar_model.predict_proba(row)[0][1])

    return {
        'pass_fail': {'prediction': pf, 'label': 'Pass' if pf == 1 else 'Fail', 'confidence': round(pf_prob, 3)},
        'grade': {'prediction': grade, 'probabilities': grade_probs},
        'gpa': {'prediction': round(gpa, 2)},
        'at_risk': {'prediction': ar, 'label': 'At Risk' if ar == 1 else 'On Track', 'confidence': round(ar_prob, 3)},
    }

def predict_batch(df: pd.DataFrame):
    if not models_ready():
        raise RuntimeError("Models not trained yet")
    missing = [f for f in FEATURES if f not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    X = df[FEATURES].fillna(df[FEATURES].median())

    pf_model = joblib.load(_path('pass_fail'))
    gr_model = joblib.load(_path('grade'))
    gpa_model = joblib.load(_path('gpa'))
    ar_model = joblib.load(_path('at_risk'))

    results = df[['student_id']].copy() if 'student_id' in df.columns else pd.DataFrame({'student_id': [f'STU{i}' for i in range(len(df))]})
    results['pass_fail'] = pf_model.predict(X)
    results['pass_label'] = results['pass_fail'].map({1: 'Pass', 0: 'Fail'})
    results['pass_confidence'] = pf_model.predict_proba(X)[:, 1].round(3)
    results['grade'] = gr_model.predict(X)
    results['predicted_gpa'] = gpa_model.predict(X).round(2).clip(0, 4)
    results['at_risk'] = ar_model.predict(X)
    results['risk_label'] = results['at_risk'].map({1: 'At Risk', 0: 'On Track'})
    results['risk_confidence'] = ar_model.predict_proba(X)[:, 1].round(3)
    return results
