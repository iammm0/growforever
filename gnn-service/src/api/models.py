"""
模型相关路由。
"""

import logging
from fastapi import APIRouter, Depends, HTTPException

from src.dependencies import get_model_manager
from src.model_manager import ModelManager

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/models")
def list_models(model_manager: ModelManager = Depends(get_model_manager)):
    """获取所有可用模型列表。"""
    try:
        models_info = []
        for name, info in model_manager.models.items():
            models_info.append(
                {
                    "name": name,
                    "type": info.get("type", "unknown"),
                    "path": info.get("path", ""),
                    "device": info.get("device", "cpu"),
                }
            )

        strategy_value = model_manager.strategy
        if isinstance(strategy_value, str):
            default_strategy = strategy_value
        else:
            default_strategy = strategy_value.value if hasattr(strategy_value, "value") else str(strategy_value)

        return {
            "models": models_info,
            "default_model": model_manager.default_model,
            "default_strategy": default_strategy,
            "total_count": len(models_info),
        }
    except Exception as exc:
        logger.error("获取模型列表失败: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取模型列表失败: {exc}")


@router.get("/models/{model_name}")
def get_model_info(model_name: str, model_manager: ModelManager = Depends(get_model_manager)):
    """获取指定NER模型的详细信息。"""
    try:
        if model_name not in model_manager.models:
            raise HTTPException(status_code=404, detail=f"模型 {model_name} 不存在")

        model_info = model_manager.models[model_name]
        return {
            "name": model_name,
            "type": model_info.get("type", "unknown"),
            "path": model_info.get("path", ""),
            "original_path": model_info.get("original_path", ""),
            "device": model_info.get("device", "cpu"),
            "status": "loaded",
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("获取模型信息失败: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取模型信息失败: {exc}")