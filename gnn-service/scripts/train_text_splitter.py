"""
文本分割模型训练脚本

使用示例：
    python train_text_splitter.py --train_data docs/training_data_example.json --epochs 3
"""

import argparse
import logging
from src.text_splitter_trainer import TextSplitterTrainer

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description='训练文本分割模型')
    parser.add_argument('--train_data', type=str, required=True,
                        help='训练数据文件路径（JSON格式）')
    parser.add_argument('--val_data', type=str, default=None,
                        help='验证数据文件路径（可选）')
    parser.add_argument('--epochs', type=int, default=3,
                        help='训练轮数（默认：3）')
    parser.add_argument('--batch_size', type=int, default=8,
                        help='批次大小（默认：8）')
    parser.add_argument('--learning_rate', type=float, default=2e-5,
                        help='学习率（默认：2e-5）')
    parser.add_argument('--output_dir', type=str, default='models/text_splitter',
                        help='模型输出目录（默认：models/text_splitter）')
    parser.add_argument('--base_model', type=str, default='bert-base-chinese',
                        help='基础模型名称（默认：bert-base-chinese）')
    
    args = parser.parse_args()
    
    logger.info("=" * 60)
    logger.info("开始训练文本分割模型")
    logger.info("=" * 60)
    logger.info(f"训练数据: {args.train_data}")
    logger.info(f"验证数据: {args.val_data}")
    logger.info(f"训练轮数: {args.epochs}")
    logger.info(f"批次大小: {args.batch_size}")
    logger.info(f"学习率: {args.learning_rate}")
    logger.info(f"输出目录: {args.output_dir}")
    logger.info(f"基础模型: {args.base_model}")
    logger.info("=" * 60)
    
    try:
        trainer = TextSplitterTrainer(
            model_name=args.base_model,
            output_dir=args.output_dir
        )
        
        trainer.train(
            train_data_path=args.train_data,
            val_data_path=args.val_data,
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.learning_rate
        )
        
        logger.info("=" * 60)
        logger.info("训练完成！")
        logger.info(f"模型已保存到: {args.output_dir}")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"训练失败: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    main()

