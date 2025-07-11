import enum
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Enum, func, ForeignKey
)
from sqlalchemy.orm import relationship
from api.core.postgres import Base

class UserRole(enum.Enum):
    USER  = "user"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(150), unique=True, nullable=False, index=True)
    email           = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active       = Column(Boolean, default=True, nullable=False)
    is_superuser    = Column(Boolean, default=False, nullable=False)
    role            = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True),
                             server_default=func.now(),
                             onupdate=func.now())
    last_login      = Column(DateTime(timezone=True), nullable=True)

    # 如果你以后要给用户分配 seed:
    seeds           = relationship("Seed", back_populates="owner")
