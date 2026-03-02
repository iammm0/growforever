"""
健康检查和基础路由
"""

from fastapi import APIRouter
from src.config import get_config
from src.dependencies import (
    get_model_manager, get_ollama_proxy, 
    get_trainer, get_evaluator
)

router = APIRouter()


@router.get("/")
def root():
    """根路径，返回服务信息"""
    config = get_config()
    return {
        "service": "GPT Service",
        "version": "1.0.0",
        "description": "推理模型服务 - 支持本地模型训练和Ollama代理",
        "environment": config.environment,
        "endpoints": {
            "/": "GET - 服务信息",
            "/health": "GET - 健康检查",
            "/models": "GET - 模型列表",
            "/generate": "POST - 文本生成",
            "/generate/stream": "POST - 流式生成",
            "/chat": "POST - 对话接口",
            "/train": "POST - 启动训练",
            "/ollama/models": "GET - Ollama模型列表"
        }
    }


@router.get("/health")
def health_check():
    """健康检查接口"""
    try:
        # 检查各个服务是否已初始化
        model_manager_ok = False
        trainer_ok = False
        evaluator_ok = False
        
        try:
            get_model_manager()
            model_manager_ok = True
        except RuntimeError:
            pass
        
        try:
            get_trainer()
            trainer_ok = True
        except RuntimeError:
            pass
        
        try:
            get_evaluator()
            evaluator_ok = True
        except RuntimeError:
            pass
        
        ollama_proxy = get_ollama_proxy()
        ollama_proxy_ok = ollama_proxy is not None
        
        status = {
            "status": "healthy",
            "service": "gpt-service",
            "model_manager": model_manager_ok,
            "ollama_proxy": ollama_proxy_ok,
            "trainer": trainer_ok,
            "evaluator": evaluator_ok
        }
        return status
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

