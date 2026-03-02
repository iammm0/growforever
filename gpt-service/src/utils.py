"""
工具函数模块
"""

import hashlib
import json
from typing import Any, Dict, Optional


def hash_prompt(prompt: str, model_name: str, **kwargs) -> str:
    """
    生成prompt的哈希值，用于缓存
    
    Args:
        prompt: 输入提示
        model_name: 模型名称
        **kwargs: 其他参数
        
    Returns:
        哈希字符串
    """
    data = {
        "prompt": prompt,
        "model": model_name,
        **kwargs
    }
    data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(data_str.encode()).hexdigest()


def format_model_size(size_bytes: int) -> str:
    """
    格式化模型大小
    
    Args:
        size_bytes: 字节数
        
    Returns:
        格式化后的字符串
    """
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} PB"


def safe_get(d: Dict[str, Any], *keys, default: Any = None) -> Any:
    """
    安全获取嵌套字典的值
    
    Args:
        d: 字典
        *keys: 键路径
        default: 默认值
        
    Returns:
        值或默认值
    """
    result = d
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key)
            if result is None:
                return default
        else:
            return default
    return result if result is not None else default

