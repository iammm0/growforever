"""
Ollama管理路由
"""

from fastapi import APIRouter, HTTPException
from src.dependencies import get_ollama_proxy
from src.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.get("/ollama/models")
async def list_ollama_models():
    """获取Ollama模型列表"""
    try:
        ollama_proxy = get_ollama_proxy()
        if ollama_proxy is None:
            raise HTTPException(status_code=500, detail="Ollama代理未初始化")
        
        models = await ollama_proxy.list_models()
        return {
            "models": models,
            "total": len(models)
        }
    except Exception as e:
        logger.error(f"获取Ollama模型列表失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取Ollama模型列表失败: {str(e)}")


@router.post("/ollama/pull")
async def pull_ollama_model(model_name: str):
    """拉取Ollama模型"""
    try:
        ollama_proxy = get_ollama_proxy()
        if ollama_proxy is None:
            raise HTTPException(status_code=500, detail="Ollama代理未初始化")
        
        result = await ollama_proxy.pull_model(model_name)
        return {
            "status": "success",
            "model_name": model_name,
            "result": result
        }
    except Exception as e:
        logger.error(f"拉取Ollama模型失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"拉取Ollama模型失败: {str(e)}")


@router.get("/ollama/stats")
def get_ollama_stats():
    """获取Ollama统计信息"""
    try:
        ollama_proxy = get_ollama_proxy()
        if ollama_proxy is None:
            raise HTTPException(status_code=500, detail="Ollama代理未初始化")
        
        stats = ollama_proxy.get_stats()
        return stats
    except Exception as e:
        logger.error(f"获取Ollama统计信息失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取Ollama统计信息失败: {str(e)}")

