"""
GNN Service 入口。
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import register_routes
from src.lifecycle import lifespan
from src.logging_config import setup_logging

# 初始化日志
setup_logging()

app = FastAPI(
    title="GNN Service",
    description="基于BERT的中文命名实体识别和知识图谱构建服务（支持智能文本分割）",
    version="2.1.0",
    lifespan=lifespan,
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
register_routes(app)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)