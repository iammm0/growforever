#!/usr/bin/env python
"""
模型评估脚本

命令行工具，用于评估模型性能。
"""

import argparse
import json
import sys
from pathlib import Path

# 添加项目根目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.config import get_config
from src.logger import setup_logger
from src.model_manager import ModelManager
from src.evaluator import ModelEvaluator

logger = setup_logger(__name__)


def load_test_data(data_path: str, format: str = "json") -> list:
    """加载测试数据"""
    data_path = Path(data_path)
    
    if not data_path.exists():
        raise FileNotFoundError(f"数据文件不存在: {data_path}")
    
    test_data = []
    
    if format == "json":
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                test_data = data
            else:
                test_data = [data]
    
    elif format == "jsonl":
        with open(data_path, 'r', encoding='utf-8') as f:
            for line in f:
                test_data.append(json.loads(line))
    
    return test_data


def main():
    parser = argparse.ArgumentParser(description="模型评估脚本")
    
    parser.add_argument(
        "--model_name",
        type=str,
        required=True,
        help="模型名称"
    )
    parser.add_argument(
        "--test_data",
        type=str,
        required=True,
        help="测试数据文件路径"
    )
    parser.add_argument(
        "--data_format",
        type=str,
        default="json",
        choices=["json", "jsonl"],
        help="数据格式"
    )
    parser.add_argument(
        "--metrics",
        type=str,
        nargs="+",
        default=["perplexity", "exact_match"],
        choices=["perplexity", "exact_match", "bleu", "rouge"],
        help="评估指标"
    )
    
    args = parser.parse_args()
    
    # 加载配置
    config = get_config()
    
    # 加载测试数据
    logger.info(f"加载测试数据: {args.test_data}")
    test_data = load_test_data(args.test_data, args.data_format)
    logger.info(f"加载了 {len(test_data)} 条测试数据")
    
    # 创建模型管理器和评估器
    model_manager = ModelManager(config)
    evaluator = ModelEvaluator(model_manager, config)
    
    # 确保模型已加载
    model_info = model_manager.get_model(args.model_name)
    if model_info is None:
        logger.warning(f"模型 {args.model_name} 未加载，尝试加载...")
        # 这里需要知道模型路径，简化处理
        logger.error("请先使用API加载模型")
        return
    
    # 执行评估
    logger.info("开始评估...")
    eval_id = evaluator.evaluate(
        model_name=args.model_name,
        test_data=test_data,
        metrics=args.metrics
    )
    
    logger.info(f"评估完成，评估ID: {eval_id}")
    
    # 获取结果
    result = evaluator.get_result(eval_id)
    if result:
        logger.info("评估结果:")
        logger.info(f"  指标: {result.metrics}")
        logger.info(f"  样本数: {len(result.samples)}")
        
        # 打印部分样本
        logger.info("\n样本评估结果（前3个）:")
        for i, sample in enumerate(result.samples[:3]):
            logger.info(f"\n样本 {i+1}:")
            logger.info(f"  输入: {sample['input'][:100]}...")
            logger.info(f"  期望: {sample['expected'][:100]}...")
            logger.info(f"  生成: {sample['generated'][:100]}...")
            logger.info(f"  匹配: {sample['match']}")


if __name__ == "__main__":
    main()

