"""
知识图谱构建模块

使用NetworkX构建和操作知识图谱，将实体和关系转换为图结构。
"""

import logging
from typing import List, Tuple, Dict, Any, Optional
import networkx as nx
import math
import random

logger = logging.getLogger(__name__)


def build_graph(
    entities: List[Tuple[str, str, bool, bool]],
    relations: List[Tuple[str, str, str]]
) -> nx.Graph:
    """
    构建知识图谱
    
    Args:
        entities: 实体列表，每个实体为 (text, label, highlight, magnified)
        relations: 关系列表，每个关系为 (entity1, relation_type, entity2)
        
    Returns:
        构建好的NetworkX图对象
    """
    G = nx.Graph()
    
    if not entities:
        logger.warning("实体列表为空，返回空图")
        return G
    
    try:
        # 遍历所有实体，构建节点数据
        for entity in entities:
            entity_text, entity_label, highlight, magnified = entity
            
            # 每个节点的数据可以是一个字典，包括 title, description, tags, highlight, magnified 等属性
            node_data = {
                "title": entity_text,  # 实体文本作为标题
                "description": f"实体类型：{entity_label}，文本：{entity_text}",  # 描述信息
                "tags": [entity_label],  # 实体类型作为标签
                "highlight": highlight,  # 高亮标志
                "magnified": magnified,  # 放大标志
                "label": entity_label,  # 保留原始标签
            }
            
            # 如果节点已存在，合并属性（保留更重要的高亮和放大标志）
            if G.has_node(entity_text):
                existing_node = G.nodes[entity_text]
                node_data["highlight"] = existing_node.get("highlight", False) or highlight
                node_data["magnified"] = existing_node.get("magnified", False) or magnified
                # 合并标签
                if entity_label not in existing_node.get("tags", []):
                    node_data["tags"] = existing_node.get("tags", []) + [entity_label]
            
            G.add_node(entity_text, **node_data)
        
        # 添加关系（边）
        for rel in relations:
            if len(rel) >= 3:
                entity1, relation_type, entity2 = rel[0], rel[1], rel[2]
                
                # 确保两个实体节点都存在
                if not G.has_node(entity1):
                    logger.warning(f"实体节点不存在: {entity1}")
                    continue
                if not G.has_node(entity2):
                    logger.warning(f"实体节点不存在: {entity2}")
                    continue
                
                # 如果边已存在，更新关系类型（保留更详细的关系）
                if G.has_edge(entity1, entity2):
                    existing_relation = G.edges[entity1, entity2].get("relationship", "")
                    # 如果新关系更具体，则更新
                    if len(relation_type) > len(existing_relation):
                        G.edges[entity1, entity2]["relationship"] = relation_type
                else:
                    G.add_edge(entity1, entity2, relationship=relation_type)
        
        logger.info(f"图谱构建完成: {G.number_of_nodes()} 个节点, {G.number_of_edges()} 条边")
        return G
        
    except Exception as e:
        logger.error(f"构建图谱时发生错误: {str(e)}", exc_info=True)
        raise


def _calculate_node_positions(G: nx.Graph, layout: str = "spring") -> Dict[str, Dict[str, float]]:
    """
    计算节点位置
    
    Args:
        G: NetworkX图对象
        layout: 布局算法，可选 "spring", "circular", "random"
        
    Returns:
        节点位置字典，格式为 {node_id: {"x": x, "y": y}}
    """
    positions = {}
    
    if G.number_of_nodes() == 0:
        return positions
    
    try:
        if layout == "spring":
            # 使用力导向布局算法
            pos = nx.spring_layout(G, k=1, iterations=50)
        elif layout == "circular":
            # 圆形布局
            pos = nx.circular_layout(G)
        else:
            # 随机布局
            pos = nx.random_layout(G)
        
        # 转换为前端需要的格式
        for node, (x, y) in pos.items():
            positions[node] = {
                "x": float(x * 200),  # 缩放以适应前端显示
                "y": float(y * 200)
            }
            
    except Exception as e:
        logger.warning(f"计算节点位置失败，使用默认位置: {str(e)}")
        # 如果布局计算失败，使用简单的圆形分布
        nodes = list(G.nodes())
        center_x, center_y = 0, 0
        radius = 100
        angle_step = 2 * math.pi / len(nodes) if len(nodes) > 0 else 0
        
        for i, node in enumerate(nodes):
            angle = i * angle_step
            positions[node] = {
                "x": float(center_x + radius * math.cos(angle)),
                "y": float(center_y + radius * math.sin(angle))
            }
    
    return positions


def graph_info(G: nx.Graph) -> Dict[str, Any]:
    """
    输出图的基本信息
    
    将NetworkX图转换为前端所需的格式，包括节点和边的信息。
    
    Args:
        G: NetworkX图对象
        
    Returns:
        包含节点和边的字典
    """
    if not G or G.number_of_nodes() == 0:
        logger.info("图为空，返回空结构")
        return {"nodes": [], "edges": []}
    
    try:
        # 计算节点位置
        positions = _calculate_node_positions(G)
        
        # 将图节点信息转换成前端所需的格式
        node_info = []
        for node in G.nodes():
            node_data = G.nodes[node]
            
            # 获取节点位置，如果计算失败则使用默认位置
            position = positions.get(node, {"x": 0, "y": 0})
            
            node_info.append({
                "id": str(node),  # 确保ID为字符串
                "type": "thought",
                "data": {
                    "title": node_data.get("title", str(node)),
                    "description": node_data.get("description", ""),
                    "tags": node_data.get("tags", []),
                    "highlight": node_data.get("highlight", False),
                    "magnified": node_data.get("magnified", False),
                    "label": node_data.get("label", ""),
                },
                "position": position,
            })
        
        # 处理边数据
        edges_info = []
        for edge in G.edges(data=True):
            source, target, edge_data = edge
            edges_info.append({
                "source": str(source),
                "target": str(target),
                "relationship": edge_data.get("relationship", "相关"),
                "data": edge_data
            })
        
        result = {
            "nodes": node_info,
            "edges": edges_info,
            "stats": {
                "node_count": G.number_of_nodes(),
                "edge_count": G.number_of_edges(),
                "is_connected": nx.is_connected(G) if G.number_of_nodes() > 0 else False
            }
        }
        
        logger.info(f"图谱信息转换完成: {len(node_info)} 个节点, {len(edges_info)} 条边")
        return result
        
    except Exception as e:
        logger.error(f"转换图谱信息时发生错误: {str(e)}", exc_info=True)
        raise
