from typing import List

from pydantic import BaseModel, Field

class SeedCreate(BaseModel):
    title: str = Field(..., description="种子标题")
    description: str | None = Field(None, description="种子描述")

class SeedResponse(SeedCreate):
    id: int
    created_at: str

    class Config:
        from_attributes = True

class ExpandRequest(BaseModel):
    prompt: str = Field(..., description="膨胀提示词")

class ExpandResponse(BaseModel):
    new_node_ids: List[int] = Field(..., description="新生成节点的 ID 列表")
