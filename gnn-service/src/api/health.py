"""
健康检查路由。
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    """健康检查接口。"""
    return {"status": "healthy", "service": "gnn-service"}

