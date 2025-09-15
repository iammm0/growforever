"""FastAPI 应用入口，负责配置中间件并挂载各个路由。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import seed, services, tests, text
from api.utils.lifespan import lifespan

# 创建 FastAPI 应用实例，lifespan 用于统一管理启动和关闭时的资源
app = FastAPI(lifespan=lifespan)

# 配置 CORS 中间件，允许任意源访问 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 依次注册各功能模块的路由
app.include_router(seed.router)  # 种子与图谱相关接口
app.include_router(services.router)  # 外部服务检测等接口
app.include_router(tests.router)  # 健康检查与测试接口
app.include_router(text.router)  # 文本相关处理接口
