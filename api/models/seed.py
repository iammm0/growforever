from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, func
from sqlalchemy.orm import relationship

from api.core.postgres import Base


class Seed(Base):
    __tablename__ = "seeds"
    id         = Column(Integer, primary_key=True, index=True, autoincrement=True)
    # ←—— 新增这一行，用来存储属于哪个用户
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # ←—— 并新增这个 relationship，名字要对得上 User.seeds 的 back_populates
    owner = relationship("User", back_populates="seeds")
    title      = Column(String(255), nullable=False)
    description= Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 与节点一对多
    nodes = relationship("Node", back_populates="seed", cascade="all, delete-orphan",)