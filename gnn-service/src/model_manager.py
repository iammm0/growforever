"""
模型管理器模块

负责加载、管理和切换多个NER和关系抽取模型。
支持单模型、多模型投票、多模型集成等策略。
"""

import logging
import os
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import torch

logger = logging.getLogger(__name__)


class ModelStrategy(str, Enum):
    """模型使用策略"""
    SINGLE = "single"  # 单模型
    VOTE = "vote"  # 多模型投票
    UNION = "union"  # 多模型并集（取所有识别结果）
    INTERSECTION = "intersection"  # 多模型交集（只保留所有模型都识别的）
    WEIGHTED = "weighted"  # 加权集成


class ModelManager:
    """模型管理器，负责加载和管理多个NER模型"""
    
    def __init__(self, config: Dict[str, Any]):
        """
        初始化模型管理器
        
        Args:
            config: 模型配置字典，包含模型列表和配置信息
        """
        self.models: Dict[str, Any] = {}
        self.model_configs = config.get("models", [])
        self.default_model = config.get("default_model", "")
        
        # 处理策略：将字符串转换为枚举
        strategy_config = config.get("default_strategy", "single")
        if isinstance(strategy_config, str):
            try:
                self.strategy = ModelStrategy(strategy_config.lower())
            except ValueError:
                logger.warning(f"未知策略: {strategy_config}，使用默认策略 SINGLE")
                self.strategy = ModelStrategy.SINGLE
        elif isinstance(strategy_config, ModelStrategy):
            self.strategy = strategy_config
        else:
            self.strategy = ModelStrategy.SINGLE
        
        self.model_weights = config.get("model_weights", {})
    
    def _is_huggingface_model(self, model_path: str) -> bool:
        """
        判断模型路径是否为 HuggingFace 模型名
        
        Args:
            model_path: 模型路径
            
        Returns:
            是否为 HuggingFace 模型名
        """
        # 如果路径是绝对路径或相对路径且存在，则不是 HuggingFace 模型
        if os.path.isabs(model_path) or os.path.exists(model_path):
            return False
        
        # 如果路径以 'models/' 开头，可能是本地路径
        if model_path.startswith('models/'):
            return False
        
        # 如果路径包含 '/' 且格式为 'org/model-name'，可能是 HuggingFace 模型
        if '/' in model_path:
            parts = model_path.split('/')
            # HuggingFace 模型格式通常是 'org/model-name'（两部分）
            if len(parts) == 2 and not parts[0].startswith('.') and not parts[1].startswith('.'):
                # 检查是否包含常见的 HuggingFace 组织名
                common_orgs = ['hfl', 'bert-base', 'roberta', 'microsoft', 'google', 'facebook', 'allenai']
                if any(parts[0].lower().startswith(org) for org in common_orgs):
                    return True
                # 如果路径不存在，且格式符合 HuggingFace 命名规范，认为是 HuggingFace 模型
                return True
        
        return False
    
    def _download_and_save_model(self, model_name: str, hf_model_path: str, local_model_path: str) -> str:
        """
        从 HuggingFace 下载模型并保存到本地
        
        Args:
            model_name: 模型名称（用于标识）
            hf_model_path: HuggingFace 模型路径
            local_model_path: 本地保存路径
            
        Returns:
            本地模型路径
        """
        # 检查本地模型是否完整（通过检查关键文件）
        config_path = os.path.join(local_model_path, "config.json")
        if os.path.exists(config_path):
            logger.info(f"模型 {model_name} 已完整存在于本地路径: {local_model_path}，跳过下载")
            return local_model_path
        
        # 创建目录
        os.makedirs(local_model_path, exist_ok=True)
        
        logger.info(f"正在从 HuggingFace 下载模型 {model_name} ({hf_model_path}) 到本地: {local_model_path}")
        
        try:
            # 下载 tokenizer
            logger.info(f"下载 tokenizer...")
            tokenizer = AutoTokenizer.from_pretrained(hf_model_path)
            tokenizer.save_pretrained(local_model_path)
            
            # 下载模型
            # 优先使用 safetensors 格式，避免 PyTorch 版本限制（CVE-2025-32434）
            logger.info(f"下载模型...")
            model = AutoModelForTokenClassification.from_pretrained(
                hf_model_path,
                use_safetensors=True  # 优先使用 safetensors 格式
            )
            model.save_pretrained(local_model_path, safe_serialization=True)
            
            logger.info(f"模型 {model_name} 已成功下载并保存到: {local_model_path}")
            return local_model_path
            
        except Exception as e:
            logger.error(f"下载模型 {model_name} 失败: {str(e)}", exc_info=True)
            # 如果下载失败，清理可能创建的不完整目录
            if os.path.exists(local_model_path):
                try:
                    import shutil
                    shutil.rmtree(local_model_path)
                except:
                    pass
            raise
    
    def load_model(self, model_name: str, model_path: str, model_type: str = "ner") -> bool:
        """
        加载单个模型
        
        优先从本地加载模型，如果本地不存在且路径是 HuggingFace 模型名，才会下载。
        
        Args:
            model_name: 模型名称（用于标识）
            model_path: 模型路径（本地路径或HuggingFace模型名）
            model_type: 模型类型（"ner"或"relation"）
            
        Returns:
            是否加载成功
        """
        try:
            if model_name in self.models:
                logger.warning(f"模型 {model_name} 已加载，跳过重复加载")
                return True
            
            logger.info(f"正在加载模型: {model_name} (路径: {model_path}, 类型: {model_type})")
            
            # 优先检查本地是否存在模型
            models_dir = "models"
            local_model_path = os.path.join(models_dir, model_name)
            actual_model_path = model_path
            
            # 检查本地模型是否存在（通过检查 config.json 文件）
            local_config_path = os.path.join(local_model_path, "config.json")
            if os.path.exists(local_config_path):
                logger.info(f"发现本地模型 {model_name}，使用本地路径: {local_model_path}")
                actual_model_path = local_model_path
            # 如果本地不存在，且配置的路径是本地路径，直接使用
            elif os.path.exists(model_path) or model_path.startswith('models/'):
                logger.info(f"使用配置的本地路径: {model_path}")
                actual_model_path = model_path
            # 如果是 HuggingFace 模型且本地不存在，才尝试下载
            elif self._is_huggingface_model(model_path):
                logger.warning(f"本地未找到模型 {model_name}，将从 HuggingFace 下载: {model_path}")
                # 确保 models 目录存在
                os.makedirs(models_dir, exist_ok=True)
                actual_model_path = self._download_and_save_model(model_name, model_path, local_model_path)
            else:
                # 其他情况，直接使用配置的路径
                actual_model_path = model_path
            
            if model_type == "ner":
                # 加载NER模型
                # 优先从本地加载，避免联网
                is_local_path = os.path.exists(actual_model_path) or actual_model_path.startswith('models/')
                
                if is_local_path:
                    # 本地路径，优先使用 local_files_only=True 避免联网
                    logger.info(f"从本地加载模型: {actual_model_path} (local_files_only=True)")
                    try:
                        tokenizer = AutoTokenizer.from_pretrained(actual_model_path, local_files_only=True)
                        model = AutoModelForTokenClassification.from_pretrained(
                            actual_model_path, 
                            local_files_only=True,
                            use_safetensors=True  # 优先使用 safetensors 格式
                        )
                    except Exception as e:
                        # 如果本地模型加载失败，直接跳过，不再尝试联网下载
                        logger.error(f"本地模型 {model_name} 加载失败: {e}，跳过该模型")
                        logger.info(f"提示：如果模型文件损坏或不完整，请手动删除 {actual_model_path} 目录后重新下载")
                        return False
                else:
                    # 远程路径，允许联网下载
                    logger.info(f"从远程加载模型: {actual_model_path}")
                    tokenizer = AutoTokenizer.from_pretrained(actual_model_path)
                    model = AutoModelForTokenClassification.from_pretrained(
                        actual_model_path,
                        use_safetensors=True  # 优先使用 safetensors 格式
                    )
                
                # 强制使用GPU
                device = 0 if torch.cuda.is_available() else -1
                if device == 0:
                    # 将模型移到GPU
                    model = model.to("cuda")
                    logger.info(f"模型 {model_name} 已加载到GPU")
                
                nlp_pipeline = pipeline(
                    "ner",
                    model=model,
                    tokenizer=tokenizer,
                    aggregation_strategy="simple",  # 聚合策略
                    device=device  # 指定设备：0=GPU, -1=CPU
                )
                
                self.models[model_name] = {
                    "pipeline": nlp_pipeline,
                    "type": "ner",
                    "path": actual_model_path,  # 保存实际使用的路径（可能是本地路径）
                    "original_path": model_path,  # 保存原始配置路径
                    "device": "cuda" if torch.cuda.is_available() else "cpu"
                }
                logger.info(f"模型 {model_name} 加载成功 (设备: {self.models[model_name]['device']}, 路径: {actual_model_path})")
                return True
            else:
                logger.warning(f"暂不支持模型类型: {model_type}")
                return False
                
        except Exception as e:
            logger.error(f"加载模型 {model_name} 失败: {str(e)}", exc_info=True)
            return False
    
    def load_all_models(self) -> int:
        """
        加载所有配置的模型
        
        如果本地模型加载失败，会从配置中移除该模型。
        
        Returns:
            成功加载的模型数量
        """
        loaded_count = 0
        failed_models = []  # 记录加载失败的模型
        
        # 创建配置列表的副本以便修改
        models_to_load = list(self.model_configs)
        
        for model_config in models_to_load:
            model_name = model_config.get("name")
            model_path = model_config.get("path")
            model_type = model_config.get("type", "ner")
            
            if not model_name or not model_path:
                logger.warning(f"模型配置不完整，跳过: {model_config}")
                continue
            
            # 检查本地模型是否存在
            models_dir = "models"
            local_model_path = os.path.join(models_dir, model_name)
            local_config_path = os.path.join(local_model_path, "config.json")
            local_model_exists = os.path.exists(local_config_path)
            
            # 如果本地模型不存在，跳过（不尝试下载）
            if not local_model_exists and self._is_huggingface_model(model_path):
                logger.info(f"本地未找到模型 {model_name}，跳过加载（不自动下载）")
                failed_models.append(model_name)
                continue
            
            # 尝试加载模型
            if self.load_model(model_name, model_path, model_type):
                loaded_count += 1
            else:
                # 加载失败，记录到失败列表
                failed_models.append(model_name)
        
        # 从配置中移除加载失败的模型
        if failed_models:
            logger.warning(f"以下模型加载失败，将从配置中移除: {failed_models}")
            self.model_configs = [
                m for m in self.model_configs 
                if m.get("name") not in failed_models
            ]
        
        logger.info(f"共加载 {loaded_count} 个模型")
        return loaded_count
    
    def get_model(self, model_name: Optional[str] = None) -> Optional[Any]:
        """
        获取指定模型，如果未指定则返回默认模型
        
        Args:
            model_name: 模型名称，如果为None则使用默认模型
            
        Returns:
            模型pipeline对象，如果不存在则返回None
        """
        if model_name is None:
            model_name = self.default_model
        
        if model_name not in self.models:
            logger.warning(f"模型 {model_name} 不存在，尝试使用默认模型")
            if self.default_model and self.default_model in self.models:
                model_name = self.default_model
            elif self.models:
                # 使用第一个可用模型
                model_name = list(self.models.keys())[0]
            else:
                logger.error("没有可用的模型")
                return None
        
        return self.models[model_name]["pipeline"]
    
    def get_all_ner_models(self) -> Dict[str, Any]:
        """
        获取所有NER模型
        
        Returns:
            模型字典，键为模型名称，值为模型信息
        """
        return {
            name: info
            for name, info in self.models.items()
            if info.get("type") == "ner"
        }
    
    def set_strategy(self, strategy: ModelStrategy):
        """设置模型使用策略"""
        self.strategy = strategy
        logger.info(f"模型策略设置为: {strategy}")
    
    def predict_single(self, text: str, model_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        使用单个模型进行预测
        
        Args:
            text: 输入文本
            model_name: 模型名称
            
        Returns:
            实体列表
        """
        model = self.get_model(model_name)
        if model is None:
            return []
        
        try:
            results = model(text)
            return results if isinstance(results, list) else []
        except Exception as e:
            logger.error(f"模型预测失败: {str(e)}", exc_info=True)
            return []
    
    def predict_vote(self, text: str, model_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        使用多模型投票策略进行预测
        
        Args:
            text: 输入文本
            model_names: 模型名称列表，如果为None则使用所有NER模型
            
        Returns:
            实体列表（投票结果）
        """
        if model_names is None:
            ner_models = self.get_all_ner_models()
            model_names = list(ner_models.keys())
        
        if not model_names:
            return []
        
        # 获取所有模型的预测结果
        all_predictions = []
        for model_name in model_names:
            predictions = self.predict_single(text, model_name)
            all_predictions.append(predictions)
        
        # 投票机制：选择被多个模型识别的实体
        entity_votes: Dict[Tuple[str, str], int] = {}  # (text, label) -> count
        
        for predictions in all_predictions:
            for pred in predictions:
                entity_text = pred.get('word', pred.get('word_group', ''))
                entity_label = pred.get('entity', 'UNKNOWN')
                if entity_text:
                    key = (entity_text.strip(), entity_label)
                    entity_votes[key] = entity_votes.get(key, 0) + 1
        
        # 选择被至少一半模型识别的实体
        threshold = len(model_names) / 2
        voted_entities = []
        for (text, label), count in entity_votes.items():
            if count >= threshold:
                voted_entities.append({
                    'word': text,
                    'entity': label,
                    'score': count / len(model_names)  # 置信度
                })
        
        return voted_entities
    
    def predict_union(self, text: str, model_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        使用并集策略：取所有模型识别结果的并集
        
        Args:
            text: 输入文本
            model_names: 模型名称列表
            
        Returns:
            实体列表（并集）
        """
        if model_names is None:
            ner_models = self.get_all_ner_models()
            model_names = list(ner_models.keys())
        
        if not model_names:
            return []
        
        seen_entities = set()
        union_entities = []
        
        for model_name in model_names:
            predictions = self.predict_single(text, model_name)
            for pred in predictions:
                entity_text = pred.get('word', pred.get('word_group', ''))
                entity_label = pred.get('entity', 'UNKNOWN')
                if entity_text:
                    key = (entity_text.strip(), entity_label)
                    if key not in seen_entities:
                        seen_entities.add(key)
                        union_entities.append({
                            'word': entity_text.strip(),
                            'entity': entity_label,
                            'model': model_name
                        })
        
        return union_entities
    
    def predict(self, text: str, model_name: Optional[str] = None, 
                strategy: Optional[ModelStrategy] = None) -> List[Dict[str, Any]]:
        """
        使用指定策略进行预测
        
        Args:
            text: 输入文本
            model_name: 模型名称（用于SINGLE策略）
            strategy: 预测策略，如果为None则使用默认策略
            
        Returns:
            实体列表
        """
        if strategy is None:
            strategy = self.strategy
        
        if strategy == ModelStrategy.SINGLE:
            return self.predict_single(text, model_name)
        elif strategy == ModelStrategy.VOTE:
            return self.predict_vote(text)
        elif strategy == ModelStrategy.UNION:
            return self.predict_union(text)
        else:
            logger.warning(f"策略 {strategy} 暂未实现，使用SINGLE策略")
            return self.predict_single(text, model_name)

