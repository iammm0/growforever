from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # PostgreSQL配置
    POSTGRES_HOST: str
    POSTGRES_PORT: int
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    # Neo4j配置
    NEO4J_URI: str
    NEO4J_USER: str
    NEO4J_PASSWORD: str

    # Qdrant 配置
    QDRANT_URL: str
    QDRANT_API_KEY: Optional[str] = None
    QDRANT_PREFER_GRPC: bool = False  # 如果想用 gRPC 通道可设为 True

    # —— 新增：GPT 服务切换 & 相关 Model/API 配置 —— #
    GPT_SERVICE_TYPE: str = "default"  # choices: default, hf, openai, remote
    HF_GPT_MODEL: str = "gpt2"  # 例如 "gpt2" 或你自定义的 HF checkpoint
    OPENAI_API_KEY: str | None = None
    OPENAI_ENGINE: str = "text-davinci-003"
    GPT_API_URL: str | None = None
    GPT_API_KEY: str | None = None

    # —— 新增：GNN 服务切换 & 相关 Model/API 配置 —— #
    GNN_SERVICE_TYPE: str = "default"  # choices: default, remote
    GNN_MODEL_PATH: str = "microsoft/graphormer"  # 本地 Graph Transformer 路径
    GNN_API_URL: str | None = None
    GNN_API_KEY: str | None = None

    # —— 其他全局配置 —— #
    USE_CUDA: bool = True

    class Config:
        env_file = ".env"


settings = Settings()

