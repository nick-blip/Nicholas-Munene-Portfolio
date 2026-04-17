import sqlite3
import os
import hashlib
from datetime import datetime

DB_PATH = os.environ.get("DB_PATH", "chatbot.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS kb_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            keywords TEXT NOT NULL,
            answer TEXT NOT NULL,
            source TEXT DEFAULT 'manual',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            response_type TEXT NOT NULL,
            rating INTEGER,
            timezone TEXT,
            flagged_for_review INTEGER DEFAULT 0,
            promoted INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)

    username = os.environ.get("ADMIN_USER", "admin")
    password = os.environ.get("ADMIN_PASS", "admin123")
    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    cur.execute(
        "INSERT OR IGNORE INTO admin (username, password_hash) VALUES (?, ?)",
        (username, pw_hash)
    )

    default_kb = [
        ("refund,money back,return,reimbursement",
         "To request a refund, visit your order history and click 'Request Refund'. Refunds are processed within 3-5 business days to your original payment method."),
        ("shipping,delivery,track,tracking,dispatch",
         "You can track your order in 'My Orders'. Standard shipping takes 5-7 business days; express shipping takes 1-2 days. Tracking updates are emailed once dispatched."),
        ("password,login,sign in,access,account,forgot",
         "To reset your password, click 'Forgot Password' on the login page. A reset link will be sent to your registered email and is valid for 24 hours."),
        ("cancel,cancellation,stop order",
         "Orders can be cancelled within 24 hours of placement. After that, please wait for delivery and initiate a return through the orders section."),
        ("contact,support,human,agent,talk,speak,call",
         "Reach our support team at support@example.com or call 0800-123-456, Monday–Friday 9am–6pm EAT. Live chat is also available on the website."),
        ("payment,pay,card,billing,invoice,charge",
         "We accept Visa, Mastercard, M-Pesa, and bank transfers. For billing issues or disputed charges, contact billing@example.com with your order number."),
        ("warranty,guarantee,broken,damaged,defective",
         "All products carry a 12-month warranty. For defective items, contact support with photos of the damage and your order number for a replacement or refund."),
    ]
    cur.executemany(
        "INSERT OR IGNORE INTO kb_entries (keywords, answer, source) VALUES (?, ?, 'default')",
        default_kb
    )

    conn.commit()
    conn.close()
    print(f"[DB] Initialised. Admin user: {username}")
