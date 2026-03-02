"""
文本处理路由：构建知识图谱。
"""

import logging
from fastapi import APIRouter, Depends, HTTPException

from src.dependencies import get_model_manager
from src.graph import build_graph, graph_info
from src.model_manager import ModelManager
from src.ner_re import extract_relations, ner
from src.schemas import GraphResponse, TextInput

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/process_text/", response_model=GraphResponse)
def process_text(data: TextInput, model_manager: ModelManager = Depends(get_model_manager)):
    """
    处理文本并构建知识图谱（支持多模型和长文本）。
    """
    try:
        logger.info("收到文本处理请求，文本长度: %s, 模型: %s, 策略: %s", len(data.text), data.model_name, data.strategy)

        # 确保模型管理器已就绪（依赖已校验）
        _ = model_manager

        entities = ner(data.text, model_name=data.model_name, strategy=data.strategy)
        logger.info("识别到 %d 个实体", len(entities))

        relations = extract_relations(entities, text=data.text)
        logger.info("提取到 %d 个关系", len(relations))

        G = build_graph(entities, relations)
        logger.info("图谱构建完成，包含 %d 个节点和 %d 条边", G.number_of_nodes(), G.number_of_edges())

        result = graph_info(G)
        logger.info("文本处理完成")
        return result

    except Exception as exc:
        logger.error("处理文本时发生错误: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"处理文本时发生错误: {exc}")