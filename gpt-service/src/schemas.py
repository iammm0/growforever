"""
请求/响应模型定义
"""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    """文本生成请求"""
    prompt: str = Field(..., description="输入提示")
    model_name: Optional[str] = Field(None, description="模型名称（可选，默认使用当前模型）")
    max_tokens: int = Field(512, description="最大生成token数")
    temperature: float = Field(0.8, ge=0.0, le=2.0, description="温度参数")
    top_p: float = Field(0.9, ge=0.0, le=1.0, description="top-p采样参数")
    top_k: Optional[int] = Field(None, description="top-k采样参数")
    repetition_penalty: float = Field(1.05, ge=1.0, description="重复惩罚")
    use_ollama: bool = Field(False, description="是否使用Ollama代理")


class GenerateResponse(BaseModel):
    """文本生成响应"""
    text: str
    model_name: str
    tokens_generated: Optional[int] = None


class ChatMessage(BaseModel):
    """聊天消息"""
    role: str = Field(..., description="角色: user, assistant, system")
    content: str = Field(..., description="消息内容")


class ChatRequest(BaseModel):
    """对话请求"""
    messages: List[ChatMessage] = Field(..., description="消息列表")
    model_name: Optional[str] = Field(None, description="模型名称")
    max_tokens: int = Field(512, description="最大生成token数")
    temperature: float = Field(0.8, ge=0.0, le=2.0, description="温度参数")
    use_ollama: bool = Field(False, description="是否使用Ollama代理")


class BatchGenerateRequest(BaseModel):
    """批量生成请求"""
    prompts: List[str] = Field(..., description="提示列表")
    model_name: Optional[str] = Field(None, description="模型名称")
    max_tokens: int = Field(512, description="最大生成token数")
    temperature: float = Field(0.8, ge=0.0, le=2.0, description="温度参数")


class LoadModelRequest(BaseModel):
    """加载模型请求"""
    model_name: str = Field(..., description="模型名称")
    model_path: Optional[str] = Field(None, description="模型路径")
    lora_adapter: Optional[str] = Field(None, description="LoRA适配器路径")


class TrainRequest(BaseModel):
    """训练请求"""
    base_model: str = Field(..., description="基础模型路径或名称")
    dataset_path: str = Field(..., description="数据集路径")
    output_dir: Optional[str] = Field(None, description="输出目录")
    num_epochs: Optional[int] = Field(None, description="训练轮数")
    batch_size: Optional[int] = Field(None, description="批次大小")
    learning_rate: Optional[float] = Field(None, description="学习率")
    dataset_format: str = Field("json", description="数据集格式: json, jsonl, txt")


class EvaluateRequest(BaseModel):
    """评估请求"""
    model_name: str = Field(..., description="模型名称")
    test_data: List[Dict[str, str]] = Field(..., description="测试数据")
    metrics: Optional[List[str]] = Field(None, description="评估指标")

