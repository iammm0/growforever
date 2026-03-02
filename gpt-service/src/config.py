"""
配置管理模块

支持环境变量和YAML配置文件，自动切换开发/生产环境。
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional, List
import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


class APIConfig(BaseModel):
    """API配置"""
    host: str = "0.0.0.0"
    port: int = 8000
    reload: bool = False


class LoggingConfig(BaseModel):
    """日志配置"""
    level: str = "INFO"
    format: str = "detailed"  # detailed 或 json
    file_enabled: bool = True
    file_path: str = "logs/gpt-service.log"
    max_bytes: int = 10485760  # 10MB
    backup_count: int = 5
    console_enabled: bool = True
    json_logger: bool = False


class ModelsConfig(BaseModel):
    """模型配置"""
    cache_dir: str = "models/cache"
    base_dir: str = "models/base"
    lora_dir: str = "models/lora"
    checkpoints_dir: str = "models/checkpoints"
    device: str = "auto"  # auto, cuda, cpu
    torch_dtype: str = "float16"
    max_memory: Optional[Dict[int, str]] = None


class OllamaInstanceConfig(BaseModel):
    """Ollama实例配置"""
    url: str
    weight: int = 1


class OllamaConfig(BaseModel):
    """Ollama配置"""
    base_url: str = "http://localhost:11434"
    timeout: int = 300
    max_retries: int = 3
    retry_delay: float = 1.0
    enable_cache: bool = False
    cache_ttl: int = 3600
    load_balancing: str = "round_robin"  # round_robin, least_connections
    instances: List[OllamaInstanceConfig] = Field(default_factory=list)


class TrainingConfig(BaseModel):
    """训练配置"""
    output_dir: str = "models/checkpoints"
    max_workers: int = 4
    batch_size: int = 4
    gradient_accumulation_steps: int = 4
    learning_rate: float = 2e-4
    num_epochs: int = 3
    save_steps: int = 500
    eval_steps: int = 500
    logging_steps: int = 10
    warmup_steps: int = 100
    max_grad_norm: float = 1.0
    fp16: bool = True
    bf16: bool = False


class RedisConfig(BaseModel):
    """Redis配置"""
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    max_connections: int = 10


class CacheConfig(BaseModel):
    """缓存配置"""
    enabled: bool = False
    type: str = "memory"  # memory 或 redis
    redis: RedisConfig = Field(default_factory=RedisConfig)


class ServiceConfig(BaseSettings):
    """服务配置"""
    
    # 环境配置
    environment: str = Field(default="dev", description="环境类型: dev 或 prod")
    
    # 子配置
    api: APIConfig = Field(default_factory=APIConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    models: ModelsConfig = Field(default_factory=ModelsConfig)
    ollama: OllamaConfig = Field(default_factory=OllamaConfig)
    training: TrainingConfig = Field(default_factory=TrainingConfig)
    cache: CacheConfig = Field(default_factory=CacheConfig)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        env_nested_delimiter = "__"
    
    @property
    def api_host(self) -> str:
        """API主机地址"""
        return self.api.host
    
    @property
    def api_port(self) -> int:
        """API端口"""
        return self.api.port
    
    @property
    def log_level(self) -> str:
        """日志级别"""
        return self.logging.level


# 全局配置实例
_config: Optional[ServiceConfig] = None
_models_config: Optional[Dict[str, Any]] = None


def load_yaml_config(config_path: Path) -> Dict[str, Any]:
    """
    加载YAML配置文件
    
    Args:
        config_path: 配置文件路径
        
    Returns:
        配置字典
    """
    if not config_path.exists():
        return {}
    
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f) or {}


def get_config() -> ServiceConfig:
    """
    获取配置实例（单例模式）
    
    Returns:
        配置实例
    """
    global _config
    
    if _config is not None:
        return _config
    
    # 确定环境
    env = os.getenv("ENVIRONMENT", "dev").lower()
    if env not in ["dev", "prod"]:
        env = "dev"
    
    # 配置文件路径
    config_dir = Path(__file__).parent.parent / "config"
    env_config_path = config_dir / f"{env}.yaml"
    
    # 加载YAML配置
    yaml_config = load_yaml_config(env_config_path)
    
    # 加载模型配置（单独存储，不作为 ServiceConfig 的一部分）
    models_config_path = config_dir / "models.yaml"
    global _models_config
    _models_config = load_yaml_config(models_config_path)
    
    # 创建配置实例
    # 首先从环境变量加载，然后用YAML配置覆盖
    # 注意：models_config 不包含在 ServiceConfig 中，需要单独获取
    _config = ServiceConfig(**yaml_config)
    
    # 确保目录存在
    _ensure_directories()
    
    return _config


def _ensure_directories():
    """确保必要的目录存在"""
    if _config is None:
        return
    
    dirs = [
        _config.models.cache_dir,
        _config.models.base_dir,
        _config.models.lora_dir,
        _config.models.checkpoints_dir,
        Path(_config.logging.file_path).parent,
    ]
    
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)


def get_models_config() -> Dict[str, Any]:
    """
    获取模型配置（从 models.yaml 加载）
    
    Returns:
        模型配置字典
    """
    global _models_config
    
    if _models_config is not None:
        return _models_config
    
    # 如果还未加载，先加载服务配置（会同时加载模型配置）
    get_config()
    
    return _models_config or {}


def reload_config():
    """重新加载配置"""
    global _config, _models_config
    _config = None
    _models_config = None
    return get_config()

