"""
根路由：服务信息。
"""

from typing import Optional

from fastapi import APIRouter, Depends

from src.dependencies import get_model_manager, get_text_splitter
from src.model_manager import ModelManager
from src.text_splitter import SemanticTextSplitter

router = APIRouter()


@router.get("/")
def root(
    model_manager: ModelManager = Depends(get_model_manager),
    text_splitter: Optional[SemanticTextSplitter] = Depends(get_text_splitter),
):
    """根路径，返回服务信息。"""
    try:
        loaded_models = list(model_manager.models.keys())
    except Exception:
        loaded_models = []

    text_splitter_status = "not_loaded"
    if text_splitter:
        text_splitter_status = "loaded" if text_splitter.use_model else "rule_based"

    return {
        "service": "GNN Service",
        "version": "2.1.0",
        "description": "基于多模型的中文命名实体识别和知识图谱构建服务（支持智能文本分割和长文本）",
        "endpoints": {
            "/process_text/": "POST - 处理文本并构建知识图谱",
            "/health": "GET - 健康检查",
            "/models": "GET - 获取NER模型列表",
            "/models/{model_name}": "GET - 获取指定NER模型信息",
            "/text_splitter": "GET - 获取文本分割模型信息",
            "/train_text_splitter/": "POST - 训练文本分割模型",
        },
        "loaded_models": loaded_models,
        "text_splitter_status": text_splitter_status,
        "available_strategies": ["single", "vote", "union", "intersection", "weighted"],
    }

