"""
应用生命周期管理：初始化模型、文本分割器等资源。
"""

import logging
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

from src.config import MODEL_CONFIG
from src.logging_config import setup_logging
from src.model_manager import ModelManager
from src.ner_re import set_model_manager
from src.text_splitter import get_text_splitter, set_text_splitter


def _log_cuda_status(logger: logging.Logger) -> None:
    """检查并记录CUDA状态。"""
    try:
        import torch

        if torch.cuda.is_available():
            logger.info(
                "CUDA可用 - GPU: %s, CUDA版本: %s",
                torch.cuda.get_device_name(0),
                torch.version.cuda,
            )
        else:
            logger.warning("CUDA不可用，将使用CPU运行")
    except Exception as exc:  # pragma: no cover - 仅记录
        logger.warning("检查CUDA时出错: %s", exc)


def _init_model_manager(logger: logging.Logger) -> ModelManager:
    """创建并加载模型管理器，只加载启用的模型。"""
    logger.info("=" * 60)
    logger.info("开始初始化模型管理器...")
    logger.info("=" * 60)

    model_manager = ModelManager(MODEL_CONFIG)
    enabled_models = [m for m in MODEL_CONFIG["models"] if m.get("enabled", True)]
    model_manager.model_configs = enabled_models

    logger.info("配置了 %d 个启用的模型:", len(enabled_models))
    for model in enabled_models:
        logger.info("  - %s: %s (%s)", model.get("name"), model.get("path"), model.get("description", ""))

    loaded_count = model_manager.load_all_models()

    logger.info("=" * 60)
    logger.info("模型初始化完成，成功加载 %d 个模型", loaded_count)
    logger.info("=" * 60)
    return model_manager


def _init_text_splitter(logger: logging.Logger) -> Any:
    """初始化文本分割器。"""
    try:
        splitter = get_text_splitter()
        set_text_splitter(splitter)
        if splitter.use_model:
            logger.info("文本分割模型已加载")
        else:
            logger.info("使用规则文本分割（未找到训练好的模型）")
        return splitter
    except Exception as exc:  # pragma: no cover - 仅记录
        logger.warning("初始化文本分割器失败: %s", exc)
        return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI 生命周期：启动时初始化资源，关闭时清理。
    """
    logger = setup_logging()
    _log_cuda_status(logger)

    model_manager = _init_model_manager(logger)
    text_splitter = _init_text_splitter(logger)

    # 让其它模块复用统一实例
    set_model_manager(model_manager)

    app.state.model_manager = model_manager
    app.state.text_splitter = text_splitter

    try:
        yield
    finally:
        logger.info("GNN Service 正在关闭")

