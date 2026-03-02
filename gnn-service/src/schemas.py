"""
请求/响应数据模型定义。
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TextInput(BaseModel):
    """文本输入模型"""
    text: str = Field(..., min_length=1, max_length=100000, description="待处理的文本内容（支持长文本）")
    model_name: Optional[str] = Field(None, description="指定使用的模型名称（可选，默认使用配置的默认模型）")
    strategy: Optional[str] = Field(
        None,
        description="模型使用策略：single（单模型）、vote（投票）、union（并集）、intersection（交集）、weighted（加权）",
    )


class GraphResponse(BaseModel):
    """图响应模型"""
    nodes: List[Dict[str, Any]]
    edges: List[Any]


class TrainTextSplitterRequest(BaseModel):
    """训练文本分割模型请求"""
    train_data_path: str = Field(..., description="训练数据文件路径（JSON格式）")
    val_data_path: Optional[str] = Field(None, description="验证数据文件路径（可选）")
    epochs: int = Field(3, description="训练轮数")
    batch_size: int = Field(8, description="批次大小")
    learning_rate: float = Field(2e-5, description="学习率")

