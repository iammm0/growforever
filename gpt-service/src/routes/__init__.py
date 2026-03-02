"""
路由模块初始化

统一注册所有路由。
"""

from fastapi import APIRouter
from src.routes import health, models, generate, train, evaluate, ollama

# 创建主路由
api_router = APIRouter()

# 注册所有子路由
api_router.include_router(health.router)
api_router.include_router(models.router)
api_router.include_router(generate.router)
api_router.include_router(train.router)
api_router.include_router(evaluate.router)
api_router.include_router(ollama.router)

__all__ = ["api_router"]

