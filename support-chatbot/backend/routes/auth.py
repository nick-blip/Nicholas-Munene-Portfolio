from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from auth_utils import authenticate_admin, create_token, verify_token, hash_password
from database import get_db

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/login")
def login(req: LoginRequest):
    if not authenticate_admin(req.username, req.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_token(req.username)
    return {"access_token": token, "token_type": "bearer", "username": req.username}

@router.get("/me")
def me(username: str = Depends(verify_token)):
    return {"username": username}

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, username: str = Depends(verify_token)):
    if not authenticate_admin(username, req.current_password):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    conn = get_db()
    conn.execute(
        "UPDATE admin SET password_hash = ? WHERE username = ?",
        (hash_password(req.new_password), username)
    )
    conn.commit()
    conn.close()
    return {"message": "Password updated successfully"}
