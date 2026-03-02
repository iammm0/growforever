"""
依赖注入工具：统一获取应用状态。
"""

from typing import Optional

from fastapi import Depends, HTTPException, Request

from src.model_manager import ModelManager
from src.text_splitter import SemanticTextSplitter


def get_model_manager(request: Request) -> ModelManager:
    """从应用状态获取模型管理器。"""
    manager: Optional[ModelManager] = getattr(request.app.state, "model_manager", None)
    if manager is None:
        raise HTTPException(status_code=500, detail="模型管理器未初始化")
    return manager


def get_text_splitter(request: Request) -> Optional[SemanticTextSplitter]:
    """从应用状态获取文本分割器（可能不存在）。"""
    return getattr(request.app.state, "text_splitter", None)

