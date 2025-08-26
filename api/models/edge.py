import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    JSON,
    Enum,
    ForeignKey,
    DateTime,
    func,
)
from sqlalchemy.orm import relationship

from api.core.postgres_connection import Base


class EdgeType(enum.Enum):
    RELATION     = "relation"
    CAUSAL       = "causal"
    SEQUENTIAL   = "sequential"
    ASSOCIATION  = "association"
    USER_DEFINED = "user_defined"

class Edge(Base):
    __tablename__ = "edges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_id = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False, index=True)
    target_id = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(Enum(EdgeType), default=EdgeType.RELATION, nullable=False)
    label = Column(String(255), nullable=True)       # 如“因果”、“同义”、“上下文”之类
    properties = Column(JSON, nullable=True)         # 存放额外元数据，如权重、标签等

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系反向引用
    source = relationship("Node", foreign_keys=[source_id], back_populates="out_edges")
    target = relationship("Node", foreign_keys=[target_id], back_populates="in_edges")
