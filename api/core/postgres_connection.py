"""PostgreSQL 数据库连接与会话管理模块。"""

import sqlalchemy

from .config import settings

# 组合出完整的数据库连接 URL，例如：
# postgresql://user:password@host:port/dbname
DATABASE_URL = (
    f"postgresql://{settings.POSTGRES_USER}:"
    f"{settings.POSTGRES_PASSWORD}@"
    f"{settings.POSTGRES_HOST}:"
    f"{settings.POSTGRES_PORT}/"
    f"{settings.POSTGRES_DB}"
)

# 创建底层 Engine，pool_pre_ping=True 能在连接失效时自动重连
engine = sqlalchemy.create_engine(DATABASE_URL, pool_pre_ping=True)

# 创建 Session 工厂，供业务逻辑获取数据库会话
SessionLocal = sqlalchemy.orm.sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

# 声明式 Base 基类，所有 ORM 模型都要继承它
Base = sqlalchemy.orm.declarative_base()


def get_db():
    """FastAPI 依赖项，提供一个数据库会话并在请求结束后自动关闭。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
