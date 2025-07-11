from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime

from api.core.postgres import get_db
from api.models.user import User
from api.utils.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)
from schemas.auth_schema import RefreshRequest
from schemas.user_schema import Token, UserCreate, UserRead

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

router = APIRouter(prefix="/auth", tags=["auth"])

# 注册
@router.post("/register", response_model=UserRead, summary="注册用户")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(400, "用户名已存在")
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(400, "邮箱已被注册")
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# 登录获取 Token
@router.post("/token", response_model=Token, summary="登录并获取访问 & 刷新令牌")
def login_for_tokens(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED,
            "用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # 更新 last_login
    user.last_login = datetime.utcnow()
    db.commit()

    access_token  = create_access_token(user.username)
    refresh_token = create_refresh_token(user.username)
    return Token(access_token=access_token, refresh_token=refresh_token)

# 刷新 Access Token
@router.post("/refresh", response_model=Token, summary="刷新访问令牌")
def refresh_token(req: RefreshRequest):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的刷新令牌",
        )

    username = payload.get("sub")
    new_access  = create_access_token(username)
    new_refresh = create_refresh_token(username)
    return Token(access_token=new_access, refresh_token=new_refresh)

# 获取当前用户
def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "无效的令牌")
    # 从 DB 读取
    db: Session = Depends(get_db)()  # 调用一次
    user = db.query(User).filter(User.username == payload.sub).first()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "未激活或不存在的用户")
    return user

# 可选：只允许 admin
def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_superuser:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "需要管理员权限")
    return user
