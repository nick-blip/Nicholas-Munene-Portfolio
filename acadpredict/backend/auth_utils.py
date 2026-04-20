import os, hashlib, jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_db

SECRET_KEY = os.environ.get("JWT_SECRET", "acadpredict-secret-change-in-prod")
ALGORITHM = "HS256"
security = HTTPBearer()

def hash_pw(p): return hashlib.sha256(p.encode()).hexdigest()

def create_token(username):
    exp = datetime.now(timezone.utc) + timedelta(hours=12)
    return jwt.encode({"sub": username, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username: raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def authenticate(username, password):
    conn = get_db()
    row = conn.execute("SELECT password_hash FROM admin WHERE username=?", (username,)).fetchone()
    conn.close()
    return row and row["password_hash"] == hash_pw(password)
