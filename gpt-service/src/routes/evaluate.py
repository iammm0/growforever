"""
评估相关路由
"""

from fastapi import APIRouter, HTTPException
from src.dependencies import get_evaluator
from src.schemas import EvaluateRequest
from src.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/evaluate")
def evaluate_model(request: EvaluateRequest):
    """评估模型"""
    try:
        evaluator = get_evaluator()
        
        eval_id = evaluator.evaluate(
            model_name=request.model_name,
            test_data=request.test_data,
            metrics=request.metrics
        )
        
        return {
            "status": "success",
            "eval_id": eval_id,
            "message": "评估任务已创建"
        }
    except Exception as e:
        logger.error(f"评估模型失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"评估模型失败: {str(e)}")


@router.get("/evaluate/results/{eval_id}")
def get_evaluation_results(eval_id: str):
    """获取评估结果"""
    try:
        evaluator = get_evaluator()
        
        result = evaluator.get_result(eval_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"评估结果 {eval_id} 不存在")
        
        return {
            "eval_id": result.eval_id,
            "model_name": result.model_name,
            "metrics": result.metrics,
            "samples": result.samples,
            "created_at": result.created_at,
            "completed_at": result.completed_at
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取评估结果失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取评估结果失败: {str(e)}")

