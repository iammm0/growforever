"""
配置文件模块

定义模型配置和系统参数。
"""

import os
from typing import Dict, Any, List

# 模型配置
MODEL_CONFIG: Dict[str, Any] = {
    # 默认模型
    "default_model": "roberta-base-chinese",
    
    # 默认策略
    "default_strategy": "single",  # single, vote, union, intersection, weighted
    
    # 模型权重（用于加权策略）
    "model_weights": {
        "roberta-base-chinese": 1.2,
        "macbert-base-chinese": 1.1,
        "roberta-large-chinese": 1.4,
    },
    
    # 模型列表（仅包含本地已成功加载的模型）
    "models": [
        {
            "name": "roberta-base-chinese",
            "path": "hfl/chinese-roberta-wwm-ext",  # HuggingFace模型
            "type": "ner",
            "description": "RoBERTa中文模型（推荐，准确率较高）",
            "enabled": True,  # 启用
        },
        {
            "name": "macbert-base-chinese",
            "path": "hfl/chinese-macbert-base",
            "type": "ner",
            "description": "MacBERT中文模型",
            "enabled": True,  # 启用
        },
        {
            "name": "roberta-large-chinese",
            "path": "hfl/chinese-roberta-wwm-ext-large",  # HuggingFace模型
            "type": "ner",
            "description": "RoBERTa Large中文模型",
            "enabled": True,  # 默认禁用，需要更多GPU内存
        },
    ],
}

# 长文本处理配置
LONG_TEXT_CONFIG: Dict[str, Any] = {
    # 最大文本长度（字符数）
    "max_text_length": 10000,
    
    # 分块大小（字符数）
    "chunk_size": 512,
    
    # 分块重叠大小（字符数），避免跨块实体被截断
    "chunk_overlap": 50,
    
    # 是否启用长文本处理
    "enable_long_text": True,
}

# 系统配置
SYSTEM_CONFIG: Dict[str, Any] = {
    # 日志级别
    "log_level": os.getenv("LOG_LEVEL", "INFO"),
    
    # API配置
    "api_host": os.getenv("API_HOST", "0.0.0.0"),
    "api_port": int(os.getenv("API_PORT", "8000")),
    
    # 模型设备 - 强制使用GPU
    "device": "cuda",  # 强制使用GPU，如果CUDA不可用会回退到CPU
}

