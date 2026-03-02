"""
依赖注入模块

管理全局服务实例，提供依赖注入功能。
"""

from typing import Optional
from src.model_manager import ModelManager
from src.ollama_proxy import OllamaProxy
from src.trainer import LoRATrainer
from src.evaluator import ModelEvaluator

# 全局管理器实例
_model_manager: Optional[ModelManager] = None
_ollama_proxy: Optional[OllamaProxy] = None
_trainer: Optional[LoRATrainer] = None
_evaluator: Optional[ModelEvaluator] = None


def get_model_manager() -> ModelManager:
    """获取模型管理器实例"""
    if _model_manager is None:
        raise RuntimeError("模型管理器未初始化")
    return _model_manager


def get_ollama_proxy() -> Optional[OllamaProxy]:
    """获取Ollama代理实例"""
    return _ollama_proxy


def get_trainer() -> LoRATrainer:
    """获取训练器实例"""
    if _trainer is None:
        raise RuntimeError("训练器未初始化")
    return _trainer


def get_evaluator() -> ModelEvaluator:
    """获取评估器实例"""
    if _evaluator is None:
        raise RuntimeError("评估器未初始化")
    return _evaluator


def set_model_manager(manager: ModelManager):
    """设置模型管理器实例"""
    global _model_manager
    _model_manager = manager


def set_ollama_proxy(proxy: OllamaProxy):
    """设置Ollama代理实例"""
    global _ollama_proxy
    _ollama_proxy = proxy


def set_trainer(trainer: LoRATrainer):
    """设置训练器实例"""
    global _trainer
    _trainer = trainer


def set_evaluator(evaluator: ModelEvaluator):
    """设置评估器实例"""
    global _evaluator
    _evaluator = evaluator


def reset_all():
    """重置所有全局实例（用于测试）"""
    global _model_manager, _ollama_proxy, _trainer, _evaluator
    _model_manager = None
    _ollama_proxy = None
    _trainer = None
    _evaluator = None

