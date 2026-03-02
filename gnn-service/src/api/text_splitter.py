"""
文本分割相关路由。
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request

from src.dependencies import get_text_splitter
from src.schemas import TrainTextSplitterRequest
from src.text_splitter import SemanticTextSplitter, get_text_splitter as load_text_splitter, set_text_splitter

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/text_splitter")
def get_text_splitter_info(text_splitter: Optional[SemanticTextSplitter] = Depends(get_text_splitter)):
    """获取文本分割模型信息。"""
    try:
        if text_splitter is None:
            return {
                "status": "not_initialized",
                "message": "文本分割器未初始化",
                "model_path": None,
                "use_model": False,
            }

        return {
            "status": "loaded" if text_splitter.use_model else "rule_based",
            "message": "使用训练好的模型" if text_splitter.use_model else "使用规则分割",
            "model_path": text_splitter.model_path,
            "use_model": text_splitter.use_model,
            "description": "基于BERT的语义文本分割模型，能够根据心理活动变化进行文本分割",
        }
    except Exception as exc:
        logger.error("获取文本分割模型信息失败: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取文本分割模型信息失败: {exc}")


@router.post("/train_text_splitter/")
def train_text_splitter(
    data: TrainTextSplitterRequest,
    request: Request,
):
    """
    训练文本分割模型。
    """
    try:
        from src.text_splitter_trainer import TextSplitterTrainer

        logger.info("开始训练文本分割模型，训练数据: %s", data.train_data_path)

        trainer = TextSplitterTrainer()
        trainer.train(
            train_data_path=data.train_data_path,
            val_data_path=data.val_data_path,
            epochs=data.epochs,
            batch_size=data.batch_size,
            learning_rate=data.learning_rate,
        )

        # 训练完成后尝试重新加载分割器
        new_splitter = load_text_splitter(trainer.output_dir)
        set_text_splitter(new_splitter)
        request.app.state.text_splitter = new_splitter

        return {
            "status": "success",
            "message": "模型训练完成",
            "model_path": trainer.output_dir,
        }

    except Exception as exc:
        logger.error("训练文本分割模型失败: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail=f"训练失败: {exc}")

