import sqlite3, os, hashlib

DB_PATH = os.environ.get("DB_PATH", "acadpredict.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE,
            name TEXT,
            attendance_rate REAL,
            missed_classes INTEGER,
            assignment_avg REAL,
            test_avg REAL,
            prior_gpa REAL,
            sei REAL,
            scholarship INTEGER,
            part_time_hours REAL,
            teacher_score REAL,
            participation REAL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            pass_fail INTEGER,
            pass_confidence REAL,
            grade TEXT,
            predicted_gpa REAL,
            at_risk INTEGER,
            risk_confidence REAL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    username = os.environ.get("ADMIN_USER", "admin")
    password = os.environ.get("ADMIN_PASS", "admin123")
    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    conn.execute("INSERT OR IGNORE INTO admin (username, password_hash) VALUES (?,?)", (username, pw_hash))
    conn.commit()
    conn.close()
    print(f"[DB] Initialised. Admin: {username}")
