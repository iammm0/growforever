"""Qdrant 向量数据库客户端与 FastAPI 依赖封装。"""

from qdrant_client import QdrantClient
from .config import settings
from typing import Generator


class QdrantSession:
    """管理 QdrantClient 的简单封装。"""

    def __init__(self):
        # 根据配置初始化 Qdrant 客户端
        self._client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            prefer_grpc=settings.QDRANT_PREFER_GRPC,
        )

    def get_client(self) -> QdrantClient:
        """返回底层的 QdrantClient 实例。"""
        return self._client


# 单例实例，整个应用仅创建一次客户端
qdrant_db = QdrantSession()


def get_qdrant() -> Generator[QdrantClient, None, None]:
    """FastAPI 依赖项，获取 QdrantClient 并在请求结束后处理清理逻辑。"""
    client = qdrant_db.get_client()
    try:
        yield client
    finally:
        # QdrantClient 无需显式关闭，但如有需要可在此处处理
        pass
