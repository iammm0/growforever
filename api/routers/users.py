from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models import User
from schemas import UserCreate, UserResponse, UserLogin
from utils.security import hash_password, verify_password
from utils.jwt import create_access_token

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=UserResponse, summary="注册账户")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first(): # type: ignore
        raise HTTPException(status_code=400, detail="用户名已存在")
    if db.query(User).filter(User.email == user.email).first(): # type: ignore
        raise HTTPException(status_code=400, detail="邮箱已被注册") # type: ignore

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", summary="登录账户")
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first() # type: ignore
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
