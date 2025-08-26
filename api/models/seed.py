from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from api.core.postgres_connection import Base


class Seed(Base):
    __tablename__ = "seeds"
    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title      = Column(String(255), nullable=False)
    description= Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 与节点一对多
    nodes = relationship("Node", back_populates="seed", cascade="all, delete-orphan",)

