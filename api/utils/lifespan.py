import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from api.core.neo4j_connection import neo4j_db
from api.core.postgres_connection import Base, engine
from api.core.qdrant_connection import qdrant_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    os.environ.pop("HTTP_PROXY", None)
    os.environ.pop("HTTPS_PROXY", None)
    # 启动阶段
    print("创建 PostgreSQL 表结构中...")
    Base.metadata.create_all(bind=engine)
    print("PostgreSQL 表已就绪")

    print("初始化 Neo4j 连接中...")
    app.state.neo4j_driver = neo4j_db._driver
    print("Neo4j 驱动连接完成")

    print("初始化 Qdrant 客户端连接中...")
    # 如果你的 QdrantSession 提供了 get_client() 方法：
    app.state.qdrant_client = qdrant_db.get_client()
    print("Qdrant 客户端连接完成")

    yield  # 让 FastAPI 启动

    # 关闭阶段
    print("应用关闭中，断开 Neo4j 驱动...")
    neo4j_db.close()
    print("Neo4j 驱动关闭完成")

    print("应用关闭中，清理 Qdrant 客户端...")
    # QdrantClient 通常无需显式关闭；如有 cleanup 逻辑可以放这里
    print("Qdrant 客户端关闭完成")