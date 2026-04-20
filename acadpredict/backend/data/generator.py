import numpy as np
import pandas as pd

def generate_students(n=2000, seed=42):
    rng = np.random.default_rng(seed)

    # Socioeconomic index 1-10
    sei = rng.normal(5.5, 2.0, n).clip(1, 10)
    scholarship = (sei < 4).astype(int) | rng.binomial(1, 0.15, n)
    part_time_hours = np.where(sei < 5, rng.integers(0, 25, n), rng.integers(0, 10, n)).astype(float)

    # Attendance (correlated with sei and part-time)
    att_base = 0.85 - 0.02 * part_time_hours / 20 + 0.01 * (sei - 5)
    attendance_rate = (att_base + rng.normal(0, 0.05, n)).clip(0.3, 1.0)
    missed_classes = ((1 - attendance_rate) * 120).astype(int)

    # Prior GPA (year 1)
    prior_gpa = (sei * 0.2 + attendance_rate * 2.5 + rng.normal(0, 0.4, n)).clip(0, 4.0)

    # Assignment scores (0-100)
    assign_base = prior_gpa * 20 + attendance_rate * 10 + rng.normal(0, 8, n)
    assignment_avg = assign_base.clip(20, 100)

    # Test/exam scores
    test_base = prior_gpa * 18 + attendance_rate * 12 + rng.normal(0, 10, n)
    test_avg = test_base.clip(15, 100)

    # Teacher assessment (1-10)
    teacher_score = (prior_gpa * 1.8 + attendance_rate * 2 + rng.normal(0, 0.8, n)).clip(1, 10)
    participation = (attendance_rate * 8 + rng.normal(0, 1, n)).clip(1, 10)

    # Composite score for labels
    composite = (
        0.25 * (test_avg / 100 * 4) +
        0.20 * (assignment_avg / 100 * 4) +
        0.20 * prior_gpa +
        0.15 * attendance_rate * 4 +
        0.10 * (teacher_score / 10 * 4) +
        0.10 * (sei / 10 * 4)
    )
    composite = composite + rng.normal(0, 0.15, n)
    composite = composite.clip(0, 4.0)

    # Final GPA
    final_gpa = composite + rng.normal(0, 0.1, n)
    final_gpa = final_gpa.clip(0, 4.0)

    # Grade A-F
    def gpa_to_grade(g):
        if g >= 3.7: return 'A'
        if g >= 3.0: return 'B'
        if g >= 2.0: return 'C'
        if g >= 1.0: return 'D'
        return 'F'
    grade = [gpa_to_grade(g) for g in final_gpa]

    # Pass/Fail (pass = GPA >= 2.0)
    pass_fail = (final_gpa >= 2.0).astype(int)

    # Dropout risk (high if attendance < 0.6, GPA trend poor, part time > 15)
    dropout_score = (
        (attendance_rate < 0.6).astype(float) * 0.4 +
        (prior_gpa < 1.5).astype(float) * 0.3 +
        (part_time_hours > 15).astype(float) * 0.2 +
        rng.uniform(0, 0.1, n)
    )
    at_risk = (dropout_score > 0.35).astype(int)

    df = pd.DataFrame({
        'student_id': [f'STU{i+1000}' for i in range(n)],
        'attendance_rate': attendance_rate.round(3),
        'missed_classes': missed_classes,
        'assignment_avg': assignment_avg.round(1),
        'test_avg': test_avg.round(1),
        'prior_gpa': prior_gpa.round(2),
        'sei': sei.round(2),
        'scholarship': scholarship,
        'part_time_hours': part_time_hours.round(1),
        'teacher_score': teacher_score.round(1),
        'participation': participation.round(1),
        'final_gpa': final_gpa.round(2),
        'grade': grade,
        'pass_fail': pass_fail,
        'at_risk': at_risk,
    })
    return df
