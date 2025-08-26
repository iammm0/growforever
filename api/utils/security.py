import os
import jwt_util
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGEME_IN_PROD")
ALGORITHM  = "HS256"
ACCESS_EXPIRE_MINUTES  = 15
REFRESH_EXPIRE_DAYS    = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(subject: str) -> str:
    now = datetime.utcnow()
    exp = now + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    to_encode: Dict[str, Any] = {"sub": subject, "exp": exp, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(subject: str) -> str:
    now = datetime.utcnow()
    exp = now + timedelta(days=REFRESH_EXPIRE_DAYS)
    to_encode: Dict[str, Any] = {"sub": subject, "exp": exp, "type": "refresh"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    解码任意 JWT，返回原始 payload dict，或 None（无效/过期/错误类型）
    """
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except (ExpiredSignatureError, InvalidTokenError):
        return None
