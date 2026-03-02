"""
模型评估模块

支持多种评估指标。
"""

import json
import uuid
from pathlib import Path
from typing import Dict, Optional, Any, List
from dataclasses import dataclass, field
from datetime import datetime

from src.config import get_config, ServiceConfig
from src.logger import setup_logger
from src.model_manager import ModelManager

logger = setup_logger(__name__)


@dataclass
class EvaluationResult:
    """评估结果"""
    eval_id: str
    model_name: str
    metrics: Dict[str, float] = field(default_factory=dict)
    samples: List[Dict[str, Any]] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    completed_at: Optional[str] = None


class ModelEvaluator:
    """模型评估器"""
    
    def __init__(
        self,
        model_manager: ModelManager,
        config: Optional[ServiceConfig] = None
    ):
        """
        初始化评估器
        
        Args:
            model_manager: 模型管理器
            config: 服务配置
        """
        self.model_manager = model_manager
        self.config = config or get_config()
        self.results: Dict[str, EvaluationResult] = {}
        
        logger.info("模型评估器初始化完成")
    
    def evaluate(
        self,
        model_name: str,
        test_data: List[Dict[str, str]],
        metrics: List[str] = None
    ) -> str:
        """
        评估模型
        
        Args:
            model_name: 模型名称
            test_data: 测试数据，格式: [{"input": "...", "expected": "..."}]
            metrics: 评估指标列表，可选: ["perplexity", "bleu", "rouge", "exact_match"]
            
        Returns:
            评估ID
        """
        eval_id = str(uuid.uuid4())
        
        if metrics is None:
            metrics = ["perplexity", "exact_match"]
        
        logger.info(f"开始评估模型: {model_name}, 评估ID: {eval_id}")
        
        try:
            result = EvaluationResult(
                eval_id=eval_id,
                model_name=model_name
            )
            
            # 获取模型
            model_info = self.model_manager.get_model(model_name)
            if model_info is None:
                raise ValueError(f"模型未找到: {model_name}")
            
            # 计算各项指标
            if "perplexity" in metrics:
                result.metrics["perplexity"] = self._calculate_perplexity(
                    model_info, test_data
                )
            
            if "exact_match" in metrics:
                result.metrics["exact_match"] = self._calculate_exact_match(
                    model_info, test_data
                )
            
            if "bleu" in metrics:
                result.metrics["bleu"] = self._calculate_bleu(
                    model_info, test_data
                )
            
            if "rouge" in metrics:
                rouge_scores = self._calculate_rouge(model_info, test_data)
                result.metrics.update(rouge_scores)
            
            # 评估样本
            result.samples = self._evaluate_samples(model_info, test_data[:10])  # 只评估前10个样本
            
            result.completed_at = datetime.now().isoformat()
            self.results[eval_id] = result
            
            logger.info(f"评估完成: {eval_id}, 指标: {result.metrics}")
            
            return eval_id
        
        except Exception as e:
            logger.error(f"评估失败: {str(e)}", exc_info=True)
            raise
    
    def _calculate_perplexity(
        self,
        model_info,
        test_data: List[Dict[str, str]]
    ) -> float:
        """
        计算困惑度
        
        Args:
            model_info: 模型信息
            test_data: 测试数据
            
        Returns:
            困惑度值
        """
        import torch
        import torch.nn.functional as F
        
        total_loss = 0.0
        total_tokens = 0
        
        model = model_info.model
        tokenizer = model_info.tokenizer
        
        model.eval()
        
        with torch.no_grad():
            for sample in test_data:
                text = sample.get("input", "") + " " + sample.get("expected", "")
                inputs = tokenizer(
                    text,
                    return_tensors="pt",
                    truncation=True,
                    max_length=512
                ).to(model.device)
                
                outputs = model(**inputs, labels=inputs["input_ids"])
                loss = outputs.loss
                
                total_loss += loss.item() * inputs["input_ids"].numel()
                total_tokens += inputs["input_ids"].numel()
        
        avg_loss = total_loss / total_tokens if total_tokens > 0 else float('inf')
        perplexity = torch.exp(torch.tensor(avg_loss)).item()
        
        return perplexity
    
    def _calculate_exact_match(
        self,
        model_info,
        test_data: List[Dict[str, str]]
    ) -> float:
        """
        计算精确匹配率
        
        Args:
            model_info: 模型信息
            test_data: 测试数据
            
        Returns:
            精确匹配率
        """
        correct = 0
        total = len(test_data)
        
        for sample in test_data:
            prompt = sample.get("input", "")
            expected = sample.get("expected", "")
            
            # 生成文本
            generated = self.model_manager.generate(
                prompt,
                model_name=model_info.name,
                max_new_tokens=len(expected.split()) * 2,
                temperature=0.0  # 确定性生成
            )
            
            if generated.strip() == expected.strip():
                correct += 1
        
        return correct / total if total > 0 else 0.0
    
    def _calculate_bleu(
        self,
        model_info,
        test_data: List[Dict[str, str]]
    ) -> float:
        """
        计算BLEU分数
        
        Args:
            model_info: 模型信息
            test_data: 测试数据
            
        Returns:
            BLEU分数
        """
        try:
            from nltk.translate.bleu_score import sentence_bleu
            try:
                import nltk
                nltk.download('punkt', quiet=True)
            except:
                pass  # 如果已下载则跳过
        except ImportError:
            logger.warning("nltk未安装，跳过BLEU计算")
            return 0.0
        
        total_bleu = 0.0
        total = len(test_data)
        
        for sample in test_data:
            prompt = sample.get("input", "")
            expected = sample.get("expected", "")
            
            # 生成文本
            generated = self.model_manager.generate(
                prompt,
                model_name=model_info.name,
                max_new_tokens=len(expected.split()) * 2
            )
            
            # 计算BLEU
            reference = expected.split()
            candidate = generated.split()
            
            bleu = sentence_bleu([reference], candidate)
            total_bleu += bleu
        
        return total_bleu / total if total > 0 else 0.0
    
    def _calculate_rouge(
        self,
        model_info,
        test_data: List[Dict[str, str]]
    ) -> Dict[str, float]:
        """
        计算ROUGE分数
        
        Args:
            model_info: 模型信息
            test_data: 测试数据
            
        Returns:
            ROUGE分数字典
        """
        try:
            from rouge_score import rouge_scorer
        except ImportError:
            logger.warning("rouge_score未安装，跳过ROUGE计算")
            return {"rouge-1": 0.0, "rouge-2": 0.0, "rouge-l": 0.0}
        
        scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
        
        total_scores = {"rouge-1": 0.0, "rouge-2": 0.0, "rouge-l": 0.0}
        total = len(test_data)
        
        for sample in test_data:
            prompt = sample.get("input", "")
            expected = sample.get("expected", "")
            
            # 生成文本
            generated = self.model_manager.generate(
                prompt,
                model_name=model_info.name,
                max_new_tokens=len(expected.split()) * 2
            )
            
            # 计算ROUGE
            scores = scorer.score(expected, generated)
            total_scores["rouge-1"] += scores["rouge1"].fmeasure
            total_scores["rouge-2"] += scores["rouge2"].fmeasure
            total_scores["rouge-l"] += scores["rougeL"].fmeasure
        
        # 平均
        for key in total_scores:
            total_scores[key] /= total if total > 0 else 1.0
        
        return total_scores
    
    def _evaluate_samples(
        self,
        model_info,
        test_data: List[Dict[str, str]]
    ) -> List[Dict[str, Any]]:
        """
        评估样本
        
        Args:
            model_info: 模型信息
            test_data: 测试数据
            
        Returns:
            样本评估结果列表
        """
        samples = []
        
        for sample in test_data:
            prompt = sample.get("input", "")
            expected = sample.get("expected", "")
            
            # 生成文本
            generated = self.model_manager.generate(
                prompt,
                model_name=model_info.name,
                max_new_tokens=512
            )
            
            samples.append({
                "input": prompt,
                "expected": expected,
                "generated": generated,
                "match": generated.strip() == expected.strip()
            })
        
        return samples
    
    def get_result(self, eval_id: str) -> Optional[EvaluationResult]:
        """
        获取评估结果
        
        Args:
            eval_id: 评估ID
            
        Returns:
            评估结果或None
        """
        return self.results.get(eval_id)
    
    def list_results(self) -> List[Dict[str, Any]]:
        """
        列出所有评估结果
        
        Returns:
            评估结果列表
        """
        return [
            {
                "eval_id": result.eval_id,
                "model_name": result.model_name,
                "metrics": result.metrics,
                "created_at": result.created_at,
                "completed_at": result.completed_at
            }
            for result in self.results.values()
        ]

