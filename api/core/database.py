import sqlalchemy

from .config import settings

DATABASE_URL = (
    f"postgresql://{settings.POSTGRES_USER}:"
    f"{settings.POSTGRES_PASSWORD}@"
    f"{settings.POSTGRES_HOST}:"
    f"{settings.POSTGRES_PORT}/"
    f"{settings.POSTGRES_DB}"
)

engine = sqlalchemy.create_engine(DATABASE_URL, pool_pre_ping=True)

# 创建Session工厂
SessionLocal = sqlalchemy.orm.sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base类供数据模型继承
Base = sqlalchemy.orm.declarative_base()

# Dependency，用于FastAPI依赖注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
