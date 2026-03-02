"""
训练相关路由
"""

from fastapi import APIRouter, HTTPException
from src.dependencies import get_trainer
from src.schemas import TrainRequest
from src.logger import setup_logger

router = APIRouter()
logger = setup_logger(__name__)


@router.post("/train")
def start_training(request: TrainRequest):
    """启动训练任务"""
    try:
        trainer = get_trainer()
        
        task_id = trainer.create_task(
            base_model=request.base_model,
            dataset_path=request.dataset_path,
            output_dir=request.output_dir,
            num_epochs=request.num_epochs,
            batch_size=request.batch_size,
            learning_rate=request.learning_rate,
            dataset_format=request.dataset_format
        )
        
        return {
            "status": "success",
            "task_id": task_id,
            "message": "训练任务已创建"
        }
    except Exception as e:
        logger.error(f"创建训练任务失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"创建训练任务失败: {str(e)}")


@router.get("/train/status/{task_id}")
def get_training_status(task_id: str):
    """获取训练状态"""
    try:
        trainer = get_trainer()
        
        task = trainer.get_task(task_id)
        if task is None:
            raise HTTPException(status_code=404, detail=f"训练任务 {task_id} 不存在")
        
        return {
            "task_id": task.task_id,
            "status": task.status,
            "progress": task.progress,
            "current_epoch": task.current_epoch,
            "total_epochs": task.total_epochs,
            "loss": task.loss,
            "error": task.error,
            "created_at": task.created_at,
            "started_at": task.started_at,
            "completed_at": task.completed_at,
            "output_dir": task.output_dir
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取训练状态失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取训练状态失败: {str(e)}")


@router.get("/train/history")
def get_training_history():
    """获取训练历史"""
    try:
        trainer = get_trainer()
        
        tasks = trainer.list_tasks()
        return {
            "tasks": tasks,
            "total": len(tasks)
        }
    except Exception as e:
        logger.error(f"获取训练历史失败: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"获取训练历史失败: {str(e)}")

