"""
日志系统模块

支持结构化日志、文件轮转、环境分离。
"""

import logging
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional, Any

try:
    from pythonjsonlogger import jsonlogger
    JSON_LOGGER_AVAILABLE = True
except ImportError:
    JSON_LOGGER_AVAILABLE = False

from src.config import get_config


class CustomJSONFormatter(jsonlogger.JsonFormatter):
    """自定义JSON格式化器"""
    
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['logger'] = record.name


class DetailedFormatter(logging.Formatter):
    """详细格式化器（用于开发环境）"""
    
    def __init__(self):
        super().__init__(
            fmt='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )


def setup_logger(
    name: str,
    level: Optional[str] = None,
    config: Optional[Any] = None
) -> logging.Logger:
    """
    设置日志记录器
    
    Args:
        name: 日志记录器名称
        level: 日志级别（可选，从配置读取）
        config: 配置对象（可选，自动获取）
        
    Returns:
        配置好的日志记录器
    """
    if config is None:
        config = get_config()
    
    logger = logging.getLogger(name)
    
    # 避免重复添加处理器
    if logger.handlers:
        return logger
    
    # 设置日志级别
    log_level = level or config.logging.level
    logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))
    
    # 清除默认处理器
    logger.handlers.clear()
    logger.propagate = False
    
    # 控制台处理器
    if config.logging.console_enabled:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logger.level)
        
        if config.logging.format == "json" and JSON_LOGGER_AVAILABLE and config.logging.json_logger:
            formatter = CustomJSONFormatter()
        else:
            formatter = DetailedFormatter()
        
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    
    # 文件处理器（带轮转）
    if config.logging.file_enabled:
        log_file_path = Path(config.logging.file_path)
        log_file_path.parent.mkdir(parents=True, exist_ok=True)
        
        file_handler = RotatingFileHandler(
            log_file_path,
            maxBytes=config.logging.max_bytes,
            backupCount=config.logging.backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(logger.level)
        
        # 文件日志始终使用JSON格式（如果可用）
        if JSON_LOGGER_AVAILABLE and config.logging.json_logger:
            formatter = CustomJSONFormatter()
        else:
            formatter = DetailedFormatter()
        
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    获取日志记录器（便捷函数）
    
    Args:
        name: 日志记录器名称
        
    Returns:
        日志记录器
    """
    return logging.getLogger(name)


# 配置根日志记录器
_root_logger = setup_logger("gpt_service")

