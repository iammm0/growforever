from qdrant_client import QdrantClient
from .config import settings
from typing import Generator

class QdrantSession:
    def __init__(self):
        self._client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            prefer_grpc=settings.QDRANT_PREFER_GRPC,
        )

    def get_client(self) -> QdrantClient:
        return self._client

# 单例实例
qdrant_db = QdrantSession()

# FastAPI 依赖注入
def get_qdrant() -> Generator[QdrantClient, None, None]:
    """
    在路由中使用：
        @router.get("/qdrant")
        def check_qdrant(client: QdrantClient = Depends(get_qdrant)):
            ...
    """
    client = qdrant_db.get_client()
    try:
        yield client
    finally:
        # QdrantClient 无需显式关闭，但如有需要可在此处处理
        pass
