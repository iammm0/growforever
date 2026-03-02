"""
模型管理器模块

负责加载、管理和切换本地模型和LoRA适配器。
"""

import os
import torch
from pathlib import Path
from typing import Dict, Optional, Any, List
from enum import Enum

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TextIteratorStreamer,
    GenerationConfig,
    AutoConfig,
)
from peft import PeftModel, LoraConfig, get_peft_model, TaskType

from src.config import get_config, ServiceConfig
from src.logger import setup_logger

logger = setup_logger(__name__)

# 向量模型相关的关键词（用于屏蔽）
VECTOR_MODEL_KEYWORDS = [
    "embed", "embedding", "vector", "sentence", "retrieval", 
    "similarity", "semantic", "encoder", "bi-encoder", "cross-encoder"
]


class ModelType(str, Enum):
    """模型类型"""
    LOCAL = "local"
    LORA = "lora"
    OLLAMA = "ollama"


class ModelInfo:
    """模型信息"""
    def __init__(
        self,
        name: str,
        model: Any,
        tokenizer: Any,
        model_type: ModelType,
        device: str,
        lora_adapter: Optional[str] = None
    ):
        self.name = name
        self.model = model
        self.tokenizer = tokenizer
        self.model_type = model_type
        self.device = device
        self.lora_adapter = lora_adapter
        self.loaded_at = None


class ModelManager:
    """模型管理器"""
    
    def __init__(self, config: Optional[ServiceConfig] = None):
        """
        初始化模型管理器
        
        Args:
            config: 服务配置
        """
        self.config = config or get_config()
        self.models: Dict[str, ModelInfo] = {}
        self.current_model: Optional[str] = None
        self.device = self._get_device()
        
        logger.info(f"模型管理器初始化，设备: {self.device}")
        
        # 检查CUDA状态
        if torch.cuda.is_available():
            logger.info(f"CUDA可用 - GPU: {torch.cuda.get_device_name(0)}, CUDA版本: {torch.version.cuda}")
        else:
            logger.warning("CUDA不可用，将使用CPU运行")
    
    def _get_device(self) -> str:
        """
        获取设备
        
        Returns:
            设备字符串
        """
        device_config = self.config.models.device
        
        if device_config == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        elif device_config == "cuda" and not torch.cuda.is_available():
            logger.warning("配置要求CUDA但不可用，回退到CPU")
            return "cpu"
        else:
            return device_config
    
    def _get_torch_dtype(self) -> torch.dtype:
        """
        获取PyTorch数据类型
        
        Returns:
            torch数据类型
        """
        dtype_str = self.config.models.torch_dtype.lower()
        
        if dtype_str == "float16":
            return torch.float16
        elif dtype_str == "bfloat16":
            return torch.bfloat16
        else:
            return torch.float32
    
    def _is_vector_model(self, model_name: str, model_path: Optional[str] = None) -> bool:
        """
        检查是否为向量/embedding模型
        
        Args:
            model_name: 模型名称
            model_path: 模型路径
            
        Returns:
            如果是向量模型返回True，否则返回False
        """
        # 检查模型名称中是否包含明确的向量模型关键词
        model_name_lower = model_name.lower()
        # 只检查明确的向量模型关键词，排除可能用于因果语言模型的模型
        explicit_vector_keywords = [
            "embedding", "vector", "sentence-transformer", "sentence_transformer",
            "bi-encoder", "cross-encoder", "retrieval", "semantic-search"
        ]
        for keyword in explicit_vector_keywords:
            if keyword in model_name_lower:
                logger.warning(f"检测到向量模型关键词 '{keyword}' 在模型名称中: {model_name}")
                return True
        
        # 检查模型路径中是否包含明确的向量模型关键词
        if model_path:
            model_path_lower = str(model_path).lower()
            for keyword in explicit_vector_keywords:
                if keyword in model_path_lower:
                    logger.warning(f"检测到向量模型关键词 '{keyword}' 在模型路径中: {model_path}")
                    return True
        
        # 尝试加载模型配置检查架构类型
        try:
            config_path = model_path or model_name
            config = AutoConfig.from_pretrained(
                config_path,
                trust_remote_code=True
            )
            
            # 检查模型架构类型
            architectures = getattr(config, 'architectures', [])
            
            # 检查是否为明确的embedding/向量检索架构（排除因果语言模型）
            explicit_embedding_architectures = [
                'sentence-transformer', 'sentence_transformer', 'bi-encoder', 
                'cross-encoder', 'retrieval', 'embedding'
            ]
            
            for arch in architectures:
                arch_lower = str(arch).lower()
                # 如果架构明确是因果语言模型，则允许
                if 'causal' in arch_lower or 'generation' in arch_lower or 'gpt' in arch_lower:
                    return False
                
                # 检查是否为明确的embedding架构
                for emb_arch in explicit_embedding_architectures:
                    if emb_arch in arch_lower:
                        logger.warning(f"检测到向量模型架构: {arch}")
                        return True
                    
        except Exception as e:
            # 如果无法加载配置，记录调试信息但不阻止加载（可能是网络问题等）
            logger.debug(f"无法检查模型配置: {str(e)}")
        
        return False
    
    def load_model(
        self,
        model_name: str,
        model_path: Optional[str] = None,
        lora_adapter: Optional[str] = None,
        **kwargs
    ) -> ModelInfo:
        """
        加载模型
        
        Args:
            model_name: 模型名称
            model_path: 模型路径（HuggingFace模型ID或本地路径）
            lora_adapter: LoRA适配器路径（可选）
            **kwargs: 其他加载参数
            
        Returns:
            模型信息对象
        """
        if model_name in self.models:
            logger.info(f"模型 {model_name} 已加载，返回现有实例")
            return self.models[model_name]
        
        logger.info(f"开始加载模型: {model_name}")
        
        # 检查是否为向量模型，如果是则拒绝加载
        if self._is_vector_model(model_name, model_path):
            error_msg = f"向量/embedding模型已被屏蔽，不允许加载: {model_name}"
            logger.error(error_msg)
            raise ValueError(error_msg)
        
        try:
            # 加载tokenizer
            tokenizer = AutoTokenizer.from_pretrained(
                model_path or model_name,
                trust_remote_code=True,
                use_fast=True
            )
            
            # 设置pad_token
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            # 加载模型
            load_kwargs = {
                "trust_remote_code": True,
                "device_map": "auto",
            }
            
            # 设置数据类型
            torch_dtype = self._get_torch_dtype()
            if torch_dtype != torch.float32:
                load_kwargs["torch_dtype"] = torch_dtype
            
            # 内存限制
            if self.config.models.max_memory:
                load_kwargs["max_memory"] = self.config.models.max_memory
            
            load_kwargs.update(kwargs)
            
            model = AutoModelForCausalLM.from_pretrained(
                model_path or model_name,
                **load_kwargs
            )
            
            # 加载LoRA适配器（如果提供）
            if lora_adapter:
                logger.info(f"加载LoRA适配器: {lora_adapter}")
                model = PeftModel.from_pretrained(model, lora_adapter)
                model_type = ModelType.LORA
            else:
                model_type = ModelType.LOCAL
            
            # 设置为评估模式
            model.eval()
            
            # 创建模型信息
            model_info = ModelInfo(
                name=model_name,
                model=model,
                tokenizer=tokenizer,
                model_type=model_type,
                device=self.device,
                lora_adapter=lora_adapter
            )
            
            self.models[model_name] = model_info
            
            if self.current_model is None:
                self.current_model = model_name
            
            logger.info(f"模型 {model_name} 加载完成")
            return model_info
            
        except Exception as e:
            logger.error(f"加载模型 {model_name} 失败: {str(e)}", exc_info=True)
            raise
    
    def unload_model(self, model_name: str) -> bool:
        """
        卸载模型
        
        Args:
            model_name: 模型名称
            
        Returns:
            是否成功卸载
        """
        if model_name not in self.models:
            logger.warning(f"模型 {model_name} 未加载")
            return False
        
        try:
            # 清理模型
            model_info = self.models[model_name]
            del model_info.model
            del model_info.tokenizer
            
            # 清理GPU缓存
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            del self.models[model_name]
            
            # 如果卸载的是当前模型，清空当前模型
            if self.current_model == model_name:
                self.current_model = None
                if self.models:
                    self.current_model = next(iter(self.models.keys()))
            
            logger.info(f"模型 {model_name} 已卸载")
            return True
            
        except Exception as e:
            logger.error(f"卸载模型 {model_name} 失败: {str(e)}", exc_info=True)
            return False
    
    def switch_model(self, model_name: str) -> bool:
        """
        切换当前模型
        
        Args:
            model_name: 模型名称
            
        Returns:
            是否成功切换
        """
        if model_name not in self.models:
            logger.warning(f"模型 {model_name} 未加载，无法切换")
            return False
        
        self.current_model = model_name
        logger.info(f"已切换到模型: {model_name}")
        return True
    
    def get_model(self, model_name: Optional[str] = None) -> Optional[ModelInfo]:
        """
        获取模型信息
        
        Args:
            model_name: 模型名称（可选，默认使用当前模型）
            
        Returns:
            模型信息对象或None
        """
        name = model_name or self.current_model
        if name is None:
            return None
        return self.models.get(name)
    
    def list_models(self) -> List[Dict[str, Any]]:
        """
        列出所有已加载的模型
        
        Returns:
            模型信息列表
        """
        result = []
        for name, info in self.models.items():
            result.append({
                "name": name,
                "type": info.model_type.value,
                "device": info.device,
                "lora_adapter": info.lora_adapter,
                "is_current": name == self.current_model
            })
        return result
    
    def generate(
        self,
        prompt: str,
        model_name: Optional[str] = None,
        max_new_tokens: int = 512,
        temperature: float = 0.8,
        top_p: float = 0.9,
        top_k: Optional[int] = None,
        repetition_penalty: float = 1.05,
        do_sample: bool = True,
        **kwargs
    ) -> str:
        """
        生成文本
        
        Args:
            prompt: 输入提示
            model_name: 模型名称（可选）
            max_new_tokens: 最大生成token数
            temperature: 温度参数
            top_p: top-p采样参数
            top_k: top-k采样参数
            repetition_penalty: 重复惩罚
            do_sample: 是否采样
            **kwargs: 其他生成参数
            
        Returns:
            生成的文本
        """
        model_info = self.get_model(model_name)
        if model_info is None:
            raise ValueError(f"模型未找到: {model_name or self.current_model}")
        
        try:
            # 编码输入
            inputs = model_info.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True
            ).to(model_info.model.device)
            
            # 生成配置
            generation_config = GenerationConfig(
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                top_k=top_k,
                repetition_penalty=repetition_penalty,
                do_sample=do_sample,
                pad_token_id=model_info.tokenizer.pad_token_id,
                eos_token_id=model_info.tokenizer.eos_token_id,
                **kwargs
            )
            
            # 生成
            with torch.no_grad():
                outputs = model_info.model.generate(
                    **inputs,
                    generation_config=generation_config
                )
            
            # 解码输出
            generated_text = model_info.tokenizer.decode(
                outputs[0],
                skip_special_tokens=True
            )
            
            # 移除输入部分
            if generated_text.startswith(prompt):
                generated_text = generated_text[len(prompt):].strip()
            
            return generated_text
            
        except Exception as e:
            logger.error(f"生成文本失败: {str(e)}", exc_info=True)
            raise
    
    def generate_stream(
        self,
        prompt: str,
        model_name: Optional[str] = None,
        max_new_tokens: int = 512,
        temperature: float = 0.8,
        top_p: float = 0.9,
        **kwargs
    ):
        """
        流式生成文本（生成器）
        
        Args:
            prompt: 输入提示
            model_name: 模型名称（可选）
            max_new_tokens: 最大生成token数
            temperature: 温度参数
            top_p: top-p采样参数
            **kwargs: 其他生成参数
            
        Yields:
            生成的token字符串
        """
        model_info = self.get_model(model_name)
        if model_info is None:
            raise ValueError(f"模型未找到: {model_name or self.current_model}")
        
        try:
            # 编码输入
            inputs = model_info.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True
            ).to(model_info.model.device)
            
            # 创建流式生成器
            streamer = TextIteratorStreamer(
                model_info.tokenizer,
                skip_prompt=True,
                skip_special_tokens=True
            )
            
            # 生成配置
            generation_config = GenerationConfig(
                max_new_tokens=max_new_tokens,
                temperature=temperature,
                top_p=top_p,
                pad_token_id=model_info.tokenizer.pad_token_id,
                eos_token_id=model_info.tokenizer.eos_token_id,
                **kwargs
            )
            
            # 异步生成
            import threading
            generation_kwargs = {
                **inputs,
                "generation_config": generation_config,
                "streamer": streamer
            }
            
            thread = threading.Thread(
                target=model_info.model.generate,
                kwargs=generation_kwargs
            )
            thread.start()
            
            # 流式输出
            for token in streamer:
                yield token
                
        except Exception as e:
            logger.error(f"流式生成文本失败: {str(e)}", exc_info=True)
            raise

