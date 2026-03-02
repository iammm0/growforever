#!/usr/bin/env python
"""
LoRA训练脚本

命令行工具，用于启动LoRA微调训练。
"""

import argparse
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import get_config
from src.logger import setup_logger
from src.trainer import LoRATrainer

logger = setup_logger(__name__)


def main():
    parser = argparse.ArgumentParser(description="LoRA微调训练脚本")
    
    parser.add_argument(
        "--base_model",
        type=str,
        required=True,
        help="基础模型路径或HuggingFace模型ID"
    )
    parser.add_argument(
        "--dataset_path",
        type=str,
        required=True,
        help="数据集文件路径"
    )
    parser.add_argument(
        "--output_dir",
        type=str,
        default=None,
        help="输出目录（可选）"
    )
    parser.add_argument(
        "--num_epochs",
        type=int,
        default=None,
        help="训练轮数"
    )
    parser.add_argument(
        "--batch_size",
        type=int,
        default=None,
        help="批次大小"
    )
    parser.add_argument(
        "--learning_rate",
        type=float,
        default=None,
        help="学习率"
    )
    parser.add_argument(
        "--dataset_format",
        type=str,
        default="json",
        choices=["json", "jsonl", "txt"],
        help="数据集格式"
    )
    parser.add_argument(
        "--max_length",
        type=int,
        default=512,
        help="最大序列长度"
    )
    
    args = parser.parse_args()
    
    # 加载配置
    config = get_config()
    
    # 创建训练器
    trainer = LoRATrainer(config)
    
    # 创建训练任务
    logger.info("创建训练任务...")
    task_id = trainer.create_task(
        base_model=args.base_model,
        dataset_path=args.dataset_path,
        output_dir=args.output_dir,
        num_epochs=args.num_epochs,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        dataset_format=args.dataset_format,
        max_length=args.max_length
    )
    
    logger.info(f"训练任务已创建，任务ID: {task_id}")
    logger.info("训练将在后台进行，使用以下命令查看状态：")
    logger.info(f"  curl http://localhost:8000/train/status/{task_id}")
    
    # 等待训练完成
    import time
    while True:
        task = trainer.get_task(task_id)
        if task is None:
            logger.error("训练任务不存在")
            break
        
        logger.info(
            f"状态: {task.status}, "
            f"进度: {task.progress:.2f}%, "
            f"轮次: {task.current_epoch}/{task.total_epochs}, "
            f"Loss: {task.loss or 'N/A'}"
        )
        
        if task.status == "completed":
            logger.info("训练完成！")
            logger.info(f"输出目录: {task.output_dir}")
            break
        elif task.status == "failed":
            logger.error(f"训练失败: {task.error}")
            break
        
        time.sleep(10)


if __name__ == "__main__":
    main()

