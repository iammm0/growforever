from sqlalchemy import Column, Integer, String, DateTime, Enum, JSON, func, ForeignKey
import enum

from sqlalchemy.orm import relationship
from api.core.postgres_connection import Base


class NodeType(enum.Enum):
    IDEA         = "idea"
    MEMORY       = "memory"
    EMOTION      = "emotion"
    FEATURE      = "feature"
    EVENT        = "event"
    USER_DEFINED = "user_defined"


class Node(Base):
    __tablename__ = "nodes"

    id            = Column(Integer, primary_key=True, index=True, autoincrement=True)
    seed_id       = Column(
                       Integer,
                       ForeignKey("seeds.id", ondelete="CASCADE"),
                       nullable=False,
                       index=True,
                   )
    parent_id     = Column(
                       Integer,
                       ForeignKey("nodes.id", ondelete="SET NULL"),
                       nullable=True,
                   )
    title         = Column(String(255), nullable=False)
    description   = Column(String(1000), nullable=True)
    type          = Column(Enum(NodeType), default=NodeType.IDEA, nullable=False)
    content       = Column(JSON, nullable=True)  # 如图片/视频/链接列表等
    node_metadata = Column(JSON, nullable=True)  # 如标签、向量等

    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    seed       = relationship("Seed", back_populates="nodes")
    parent     = relationship("Node", remote_side=[id], post_update=True)
    out_edges  = relationship(
                   "Edge",
                   back_populates="source",
                   foreign_keys="[Edge.source_id]"
               )
    in_edges   = relationship(
                   "Edge",
                   back_populates="target",
                   foreign_keys="[Edge.target_id]"
               )