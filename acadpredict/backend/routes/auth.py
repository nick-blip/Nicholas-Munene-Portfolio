from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth_utils import authenticate, create_token, verify_token, hash_pw
from database import get_db

router = APIRouter()

class LoginReq(BaseModel):
    username: str
    password: str

class ChangePwReq(BaseModel):
    current_password: str
    new_password: str

@router.post("/login")
def login(req: LoginReq):
    if not authenticate(req.username, req.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_token(req.username), "token_type": "bearer", "username": req.username}

@router.get("/me")
def me(username: str = Depends(verify_token)):
    return {"username": username}

@router.post("/change-password")
def change_pw(req: ChangePwReq, username: str = Depends(verify_token)):
    if not authenticate(username, req.current_password):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    conn = get_db()
    conn.execute("UPDATE admin SET password_hash=? WHERE username=?", (hash_pw(req.new_password), username))
    conn.commit(); conn.close()
    return {"message": "Password updated"}
