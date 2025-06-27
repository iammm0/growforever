from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class NodeType(str, Enum):
    idea = "idea"
    memory = "memory"
    emotion = "emotion"
    feature = "feature"
    event = "event"
    user_defined = "user_defined"

class NodeContent(BaseModel):
    media: Optional[List[str]] = Field(None, description="图片、视频、音频URL列表")
    links: Optional[List[str]] = Field(None, description="外部链接列表")
    rich_text: Optional[str] = Field(None, description="附带的富文本内容")

class NodeMetadata(BaseModel):
    tags: Optional[List[str]] = Field(None, description="节点标签列表")
    emotions: Optional[List[str]] = Field(None, description="关联的情绪标签")
    vector: Optional[List[float]] = Field(None, description="节点的特征向量，用于AI模型分析")
    extra: Optional[Dict[str, str]] = Field(None, description="用户自定义额外字段")

class NodeBase(BaseModel):
    title: str = Field(..., max_length=255, description="节点标题")
    description: Optional[str] = Field(None, max_length=1000, description="节点详细描述")
    type: NodeType = Field(default=NodeType.idea, description="节点类型")
    content: Optional[NodeContent] = Field(None, description="节点内容")
    node_metadata: Optional[NodeMetadata] = Field(None, description="节点扩展元数据")

class NodeCreate(NodeBase):
    pass  # 创建节点所需字段与基础字段相同

class NodeUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    type: Optional[NodeType] = None
    content: Optional[NodeContent] = None
    node_metadata: Optional[NodeMetadata] = None

class NodeResponse(NodeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True  # SQLAlchemy兼容模式（Pydantic v2新推荐）
