from sqlalchemy import Column, Integer, String, DateTime, Enum, JSON, func
from core.database import Base
import enum

class NodeType(enum.Enum):
    IDEA = "idea"
    MEMORY = "memory"
    EMOTION = "emotion"
    FEATURE = "feature"
    EVENT = "event"
    USER_DEFINED = "user_defined"

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    type = Column(Enum(NodeType), default=NodeType.IDEA, nullable=False)
    content = Column(JSON, nullable=True)  # 存放附加信息如图片、视频、链接、富文本
    node_metadata = Column(JSON, nullable=True)  # 用户定义的额外数据、标签、特征向量
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
