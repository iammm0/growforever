"""
命名实体识别和关系抽取模块

支持多模型和长文本处理的命名实体识别和关系抽取。
"""

import logging
import re
from typing import List, Tuple, Optional, Dict, Any
try:
    from .model_manager import ModelManager, ModelStrategy
except ImportError:
    # 处理循环导入问题
    ModelManager = None
    ModelStrategy = None
from .config import MODEL_CONFIG, LONG_TEXT_CONFIG

logger = logging.getLogger(__name__)

# 全局模型管理器
_model_manager: Optional[Any] = None


def set_model_manager(manager: Any) -> None:
    """供外部注入模型管理器，避免重复初始化。"""
    global _model_manager
    _model_manager = manager


def _get_model_manager() -> Any:
    """获取或初始化模型管理器"""
    global _model_manager
    if _model_manager is None:
        if ModelManager is None:
            raise ImportError("ModelManager未正确导入，请检查model_manager模块")
        logger.info("初始化模型管理器...")
        _model_manager = ModelManager(MODEL_CONFIG)
        # 只加载启用的模型
        enabled_models = [m for m in MODEL_CONFIG["models"] if m.get("enabled", True)]
        _model_manager.model_configs = enabled_models
        _model_manager.load_all_models()
    return _model_manager


def _split_long_text(text: str, graph_data: Optional[Dict[str, Any]] = None) -> List[Tuple[str, int]]:
    """
    将长文本分割成多个块（支持基于语义/心理活动变化的分割）
    
    Args:
        text: 输入文本
        graph_data: 图数据（可选），用于提取分割点
        
    Returns:
        文本块列表，每个元素为 (chunk_text, start_position)
    """
    if not LONG_TEXT_CONFIG.get("enable_long_text", True):
        return [(text, 0)]
    
    # 尝试使用训练好的文本分割模型
    try:
        from .text_splitter import get_text_splitter
        splitter = get_text_splitter()
        chunks = splitter.split_by_semantic_chunks(text, graph_data)
        if chunks:
            logger.info(f"使用语义分割模型，文本分割为 {len(chunks)} 个块")
            return chunks
    except Exception as e:
        logger.debug(f"使用语义分割模型失败: {e}，使用规则分割")
    
    # 回退到规则分割
    chunk_size = LONG_TEXT_CONFIG.get("chunk_size", 512)
    chunk_overlap = LONG_TEXT_CONFIG.get("chunk_overlap", 50)
    
    # 如果文本长度小于块大小，直接返回
    if len(text) <= chunk_size:
        return [(text, 0)]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        
        if end >= len(text):
            # 最后一个块
            chunks.append((text[start:], start))
            break
        
        # 尝试在句号、问号、感叹号等标点处分割
        chunk_text = text[start:end]
        last_period = max(
            chunk_text.rfind('。'),
            chunk_text.rfind('！'),
            chunk_text.rfind('？'),
            chunk_text.rfind('；'),
            chunk_text.rfind('\n'),
        )
        
        if last_period > chunk_size * 0.5:  # 如果找到的分割点在中间偏后
            end = start + last_period + 1
        
        chunks.append((text[start:end], start))
        
        # 下一个块的起始位置，考虑重叠
        start = end - chunk_overlap
        if start < 0:
            start = 0
    
    logger.info(f"使用规则分割，文本分割为 {len(chunks)} 个块")
    return chunks


def _merge_entities_from_chunks(chunk_entities: List[List[Tuple[str, str, bool, bool]]], 
                                chunk_positions: List[int]) -> List[Tuple[str, str, bool, bool]]:
    """
    合并多个块的实体识别结果
    
    Args:
        chunk_entities: 每个块的实体列表
        chunk_positions: 每个块在原文本中的起始位置
        
    Returns:
        合并后的实体列表
    """
    seen_entities = set()
    merged_entities = []
    
    for entities, _ in zip(chunk_entities, chunk_positions):
        for entity in entities:
            entity_key = (entity[0], entity[1])  # (text, label)
            if entity_key not in seen_entities:
                seen_entities.add(entity_key)
                merged_entities.append(entity)
    
    return merged_entities


def ner(text: str, model_name: Optional[str] = None, 
        strategy: Optional[str] = None) -> List[Tuple[str, str, bool, bool]]:
    """
    命名实体识别（支持多模型和长文本）
    
    Args:
        text: 待识别的文本
        model_name: 模型名称（None则使用默认模型或策略）
        strategy: 策略名称 ("single", "vote", "union", "intersection", "weighted")
        
    Returns:
        实体列表，每个实体为元组 (text, label, highlight, magnified)
        - text: 实体文本
        - label: 实体类型标签
        - highlight: 是否高亮
        - magnified: 是否放大
    """
    if not text or not text.strip():
        logger.warning("输入文本为空")
        return []
    
    try:
        model_manager = _get_model_manager()
        
        # 处理长文本：如果文本太长，进行分块处理
        chunks = _split_long_text(text)
        
        all_entities = []
        
        # 转换策略字符串为ModelStrategy枚举
        model_strategy = None
        if strategy and ModelStrategy is not None:
            try:
                model_strategy = ModelStrategy(strategy.lower())
            except (ValueError, AttributeError):
                logger.warning(f"未知策略: {strategy}，使用默认策略")
        
        # 对每个块进行识别
        for chunk_text, start_pos in chunks:
            # 使用模型管理器进行预测
            predictions = model_manager.predict(chunk_text, model_name, model_strategy)
            
            if not predictions:
                continue
            
            # 处理预测结果
            for entity in predictions:
                # 处理不同字段名
                entity_text = entity.get('word', entity.get('word_group', ''))
                entity_label = entity.get('entity', 'UNKNOWN')
                
                # 跳过空文本
                if not entity_text or not entity_text.strip():
                    continue
                
                node_data = {
                    "text": entity_text.strip(),
                    "label": entity_label,
                    "highlight": False,
                    "magnified": False,
                }
                
                # 设置 highlight 和 magnified 的规则
                if node_data["label"] == "PERSON":
                    node_data["highlight"] = True
                if "北京" in node_data["text"]:
                    node_data["magnified"] = True
                
                all_entities.append((
                    node_data["text"],
                    node_data["label"],
                    node_data["highlight"],
                    node_data["magnified"]
                ))
        
        # 去重处理
        seen_entities = set()
        unique_entities = []
        for entity in all_entities:
            entity_key = (entity[0], entity[1])  # (text, label)
            if entity_key not in seen_entities:
                seen_entities.add(entity_key)
                unique_entities.append(entity)
        
        logger.info(f"识别到 {len(unique_entities)} 个唯一实体（原始: {len(all_entities)}）")
        return unique_entities
        
    except Exception as e:
        logger.error(f"命名实体识别失败: {str(e)}", exc_info=True)
        raise


def extract_relations(entities: List[Tuple[str, str, bool, bool]], 
                     text: Optional[str] = None) -> List[Tuple[str, str, str]]:
    """
    关系抽取（支持基于文本上下文的关系抽取）
    
    基于实体在文本中的位置关系和上下文，抽取实体之间的关系。
    这是一个简化的实现，实际应用中可以使用更复杂的关系抽取模型。
    
    Args:
        entities: 实体列表，每个实体为 (text, label, highlight, magnified)
        text: 原始文本（可选，用于更精确的关系抽取）
        
    Returns:
        关系列表，每个关系为元组 (entity1, relation_type, entity2)
    """
    if not entities or len(entities) < 2:
        logger.info("实体数量不足，无法提取关系")
        return []
    
    relations = []
    
    # 如果提供了原始文本，可以基于文本中实体位置提取关系
    if text:
        # 构建实体位置映射
        entity_positions = {}
        for entity in entities:
            entity_text = entity[0]
            # 查找所有出现位置
            positions = [m.start() for m in re.finditer(re.escape(entity_text), text)]
            if positions:
                entity_positions[entity_text] = positions
        
        # 基于文本中实体距离提取关系
        entity_list = list(entities)
        for i in range(len(entity_list) - 1):
            entity1 = entity_list[i]
            entity2 = entity_list[i + 1]
            
            # 检查两个实体在文本中是否相邻或接近
            if entity1[0] in entity_positions and entity2[0] in entity_positions:
                pos1 = entity_positions[entity1[0]][0]
                pos2 = entity_positions[entity2[0]][0]
                distance = abs(pos2 - pos1)
                
                # 如果距离较近（小于100字符），提取关系
                if distance < 100:
                    relation_type = _determine_relation_type(entity1[1], entity2[1])
                    # 检查文本中是否有更明确的关系词
                    relation_type = _extract_relation_from_text(
                        text, entity1[0], entity2[0], pos1, pos2, relation_type
                    )
                    relations.append((entity1[0], relation_type, entity2[0]))
    else:
        # 简单策略：基于实体类型和位置提取关系
        for i in range(len(entities) - 1):
            entity1 = entities[i]
            entity2 = entities[i + 1]
            
            # 根据实体类型确定关系类型
            relation_type = _determine_relation_type(entity1[1], entity2[1])
            
            relation = (entity1[0], relation_type, entity2[0])
            relations.append(relation)
    
    logger.info(f"提取到 {len(relations)} 个关系")
    return relations


def _extract_relation_from_text(text: str, entity1: str, entity2: str, 
                                pos1: int, pos2: int, default_relation: str) -> str:
    """
    从文本中提取更精确的关系
    
    Args:
        text: 原始文本
        entity1: 第一个实体
        entity2: 第二个实体
        pos1: 第一个实体位置
        pos2: 第二个实体位置
        default_relation: 默认关系类型
        
    Returns:
        关系类型
    """
    # 提取两个实体之间的文本片段
    start = min(pos1, pos2)
    end = max(pos1 + len(entity1), pos2 + len(entity2))
    context = text[start:end]
    
    # 定义常见关系词
    relation_patterns = {
        "工作于": ["工作", "就职", "任职", "供职"],
        "位于": ["位于", "在", "坐落", "地处"],
        "属于": ["属于", "隶属于", "归属于"],
        "创建": ["创建", "创立", "建立", "成立"],
        "毕业于": ["毕业于", "毕业", "就读"],
        "是": ["是", "为", "成为"],
    }
    
    # 检查上下文中是否有关系词
    for relation, keywords in relation_patterns.items():
        for keyword in keywords:
            if keyword in context:
                return relation
    
    return default_relation


def _determine_relation_type(label1: str, label2: str) -> str:
    """
    根据实体类型确定关系类型
    
    Args:
        label1: 第一个实体的类型
        label2: 第二个实体的类型
        
    Returns:
        关系类型字符串
    """
    # 简单的规则映射，可以根据实际需求扩展
    if label1 == "PERSON" and label2 == "ORG":
        return "工作于"
    elif label1 == "PERSON" and label2 == "LOC":
        return "位于"
    elif label1 == "ORG" and label2 == "LOC":
        return "位于"
    else:
        return "与"