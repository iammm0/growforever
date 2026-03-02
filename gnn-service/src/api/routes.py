"""
统一注册API路由。
"""

from fastapi import FastAPI

from src.api import health, models, process, root, text_splitter


def register_routes(app: FastAPI) -> None:
    """注册所有子路由。"""
    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(models.router)
    app.include_router(text_splitter.router)
    app.include_router(process.router)

