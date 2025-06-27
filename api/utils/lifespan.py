from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.database import Base, engine
from core.neo4jConfig import neo4j_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🚀 启动阶段
    print("📦 创建 PostgreSQL 表结构中...")
    Base.metadata.create_all(bind=engine)
    print("✅ PostgreSQL 表已就绪")

    print("🔌 初始化 Neo4j 连接中...")
    app.state.neo4j_driver = neo4j_db._driver
    print("✅ Neo4j 驱动连接完成")

    yield  # 🔁 让 FastAPI 启动

    # 🛑 关闭阶段
    print("🧹 应用关闭中，断开 Neo4j 驱动...")
    neo4j_db.close()
    print("🔌 Neo4j 驱动关闭完成")