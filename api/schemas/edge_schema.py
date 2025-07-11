from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class EdgeType(str, Enum):
    relation     = "relation"
    causal       = "causal"
    sequential   = "sequential"
    association  = "association"
    user_defined = "user_defined"


class EdgeProperties(BaseModel):
    weight: Optional[float] = Field(
        None, description="关系权重，用于表示强度或置信度"
    )
    tags: Optional[List[str]] = Field(
        None, description="关系标签列表"
    )
    extra: Optional[Dict[str, str]] = Field(
        None, description="用户自定义的额外字段"
    )


class EdgeBase(BaseModel):
    source_id: int = Field(..., description="起始节点 ID")
    target_id: int = Field(..., description="目标节点 ID")
    type: EdgeType = Field(
        default=EdgeType.relation,
        description="边的类型"
    )
    label: Optional[str] = Field(
        None, max_length=255, description="边的标签或简要描述"
    )
    properties: Optional[EdgeProperties] = Field(
        None, description="边的元数据"
    )


class EdgeCreate(EdgeBase):
    """
    创建边时使用的模式，与 EdgeBase 相同。
    """
    pass


class EdgeUpdate(BaseModel):
    source_id: Optional[int] = Field(None, description="起始节点 ID")
    target_id: Optional[int] = Field(None, description="目标节点 ID")
    type: Optional[EdgeType] = Field(None, description="边的类型")
    label: Optional[str] = Field(
        None, max_length=255, description="边的标签或简要描述"
    )
    properties: Optional[EdgeProperties] = Field(
        None, description="边的元数据"
    )


class EdgeResponse(EdgeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {
        "from_attributes": True  # Pydantic v2 ORM 兼容
    }