"""
日志配置工具
"""

import logging


def setup_logging() -> logging.Logger:
    """初始化基础日志配置，返回服务主logger。"""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    logger = logging.getLogger("gnn-service")
    return logger

