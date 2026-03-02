"""
LoRA训练模块

支持PEFT微调、检查点保存、进度跟踪。
"""

import os
import json
import uuid
from pathlib import Path
from typing import Dict, Optional, Any, List
from dataclasses import dataclass, field
from datetime import datetime
import threading

import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
    TrainerCallback,
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

from src.config import get_config, ServiceConfig
from src.logger import setup_logger

logger = setup_logger(__name__)


@dataclass
class TrainingTask:
    """训练任务"""
    task_id: str
    status: str = "pending"  # pending, running, completed, failed
    progress: float = 0.0
    current_epoch: int = 0
    total_epochs: int = 0
    loss: Optional[float] = None
    error: Optional[str] = None
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    output_dir: Optional[str] = None


class TextDataset(Dataset):
    """文本数据集"""
    
    def __init__(self, texts: List[str], tokenizer, max_length: int = 512):
        self.texts = texts
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )
        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten()
        }


class LoRATrainer:
    """LoRA训练器"""
    
    def __init__(self, config: Optional[ServiceConfig] = None):
        """
        初始化训练器
        
        Args:
            config: 服务配置
        """
        self.config = config or get_config()
        self.training_config = self.config.training
        
        # 训练任务字典
        self.tasks: Dict[str, TrainingTask] = {}
        self._lock = threading.Lock()
        
        logger.info("LoRA训练器初始化完成")
    
    def _load_dataset(self, data_path: str, format: str = "json") -> List[str]:
        """
        加载数据集
        
        Args:
            data_path: 数据文件路径
            format: 数据格式（json, jsonl, txt）
            
        Returns:
            文本列表
        """
        texts = []
        data_path = Path(data_path)
        
        if not data_path.exists():
            raise FileNotFoundError(f"数据文件不存在: {data_path}")
        
        if format == "json":
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            texts.append(item.get("text", ""))
                        else:
                            texts.append(str(item))
                else:
                    texts.append(str(data))
        
        elif format == "jsonl":
            with open(data_path, 'r', encoding='utf-8') as f:
                for line in f:
                    item = json.loads(line)
                    if isinstance(item, dict):
                        texts.append(item.get("text", ""))
                    else:
                        texts.append(str(item))
        
        elif format == "txt":
            with open(data_path, 'r', encoding='utf-8') as f:
                texts = [line.strip() for line in f if line.strip()]
        
        else:
            raise ValueError(f"不支持的数据格式: {format}")
        
        logger.info(f"加载数据集: {len(texts)} 条文本")
        return texts
    
    def create_task(
        self,
        base_model: str,
        dataset_path: str,
        output_dir: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        创建训练任务
        
        Args:
            base_model: 基础模型路径或名称
            dataset_path: 数据集路径
            output_dir: 输出目录（可选）
            **kwargs: 其他训练参数
            
        Returns:
            任务ID
        """
        task_id = str(uuid.uuid4())
        
        if output_dir is None:
            output_dir = Path(self.training_config.output_dir) / task_id
        else:
            output_dir = Path(output_dir)
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        task = TrainingTask(
            task_id=task_id,
            status="pending",
            total_epochs=kwargs.get("num_epochs", self.training_config.num_epochs),
            output_dir=str(output_dir)
        )
        
        with self._lock:
            self.tasks[task_id] = task
        
        logger.info(f"创建训练任务: {task_id}")
        
        # 在后台线程中启动训练
        thread = threading.Thread(
            target=self._train_worker,
            args=(task_id, base_model, dataset_path, output_dir, kwargs),
            daemon=True
        )
        thread.start()
        
        return task_id
    
    def _train_worker(
        self,
        task_id: str,
        base_model: str,
        dataset_path: str,
        output_dir: Path,
        kwargs: Dict[str, Any]
    ):
        """训练工作线程"""
        task = self.tasks.get(task_id)
        if task is None:
            return
        
        try:
            task.status = "running"
            task.started_at = datetime.now().isoformat()
            
            logger.info(f"开始训练任务: {task_id}")
            
            # 加载tokenizer和模型
            tokenizer = AutoTokenizer.from_pretrained(base_model, trust_remote_code=True)
            if tokenizer.pad_token is None:
                tokenizer.pad_token = tokenizer.eos_token
            
            model = AutoModelForCausalLM.from_pretrained(
                base_model,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.training_config.fp16 else torch.float32,
                device_map="auto"
            )
            
            # 配置LoRA
            lora_config = kwargs.get("lora_config", {})
            peft_config = LoraConfig(
                r=lora_config.get("r", 16),
                lora_alpha=lora_config.get("lora_alpha", 32),
                target_modules=lora_config.get("target_modules", ["q_proj", "k_proj", "v_proj", "o_proj"]),
                lora_dropout=lora_config.get("lora_dropout", 0.05),
                bias=lora_config.get("bias", "none"),
                task_type=TaskType.CAUSAL_LM
            )
            
            model = get_peft_model(model, peft_config)
            model.print_trainable_parameters()
            
            # 加载数据集
            dataset_format = kwargs.get("dataset_format", "json")
            texts = self._load_dataset(dataset_path, format=dataset_format)
            
            # 划分训练集和验证集
            val_split = kwargs.get("val_split", 0.1)
            val_size = int(len(texts) * val_split)
            train_texts = texts[:-val_size] if val_size > 0 else texts
            val_texts = texts[-val_size:] if val_size > 0 else []
            
            train_dataset = TextDataset(train_texts, tokenizer, max_length=kwargs.get("max_length", 512))
            val_dataset = TextDataset(val_texts, tokenizer, max_length=kwargs.get("max_length", 512)) if val_texts else None
            
            # 数据整理器
            data_collator = DataCollatorForLanguageModeling(
                tokenizer=tokenizer,
                mlm=False
            )
            
            # 训练参数
            training_args = TrainingArguments(
                output_dir=str(output_dir),
                num_train_epochs=kwargs.get("num_epochs", self.training_config.num_epochs),
                per_device_train_batch_size=kwargs.get("batch_size", self.training_config.batch_size),
                gradient_accumulation_steps=kwargs.get(
                    "gradient_accumulation_steps",
                    self.training_config.gradient_accumulation_steps
                ),
                learning_rate=kwargs.get("learning_rate", self.training_config.learning_rate),
                warmup_steps=kwargs.get("warmup_steps", self.training_config.warmup_steps),
                logging_steps=kwargs.get("logging_steps", self.training_config.logging_steps),
                save_steps=kwargs.get("save_steps", self.training_config.save_steps),
                eval_steps=kwargs.get("eval_steps", self.training_config.eval_steps) if val_dataset else None,
                evaluation_strategy="steps" if val_dataset else "no",
                save_total_limit=3,
                load_best_model_at_end=True if val_dataset else False,
                fp16=self.training_config.fp16,
                bf16=self.training_config.bf16,
                max_grad_norm=self.training_config.max_grad_norm,
                report_to="none",  # 禁用wandb等
            )
            
            # 创建Trainer
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=train_dataset,
                eval_dataset=val_dataset,
                data_collator=data_collator,
                callbacks=[TrainingProgressCallback(task_id, self)]
            )
            
            # 训练
            trainer.train()
            
            # 保存模型
            model.save_pretrained(str(output_dir / "lora_adapter"))
            tokenizer.save_pretrained(str(output_dir / "lora_adapter"))
            
            task.status = "completed"
            task.completed_at = datetime.now().isoformat()
            task.progress = 100.0
            
            logger.info(f"训练任务完成: {task_id}")
        
        except Exception as e:
            task.status = "failed"
            task.error = str(e)
            task.completed_at = datetime.now().isoformat()
            logger.error(f"训练任务失败: {task_id}, 错误: {str(e)}", exc_info=True)
    
    def get_task(self, task_id: str) -> Optional[TrainingTask]:
        """
        获取训练任务
        
        Args:
            task_id: 任务ID
            
        Returns:
            训练任务或None
        """
        return self.tasks.get(task_id)
    
    def list_tasks(self) -> List[Dict[str, Any]]:
        """
        列出所有训练任务
        
        Returns:
            任务列表
        """
        return [
            {
                "task_id": task.task_id,
                "status": task.status,
                "progress": task.progress,
                "current_epoch": task.current_epoch,
                "total_epochs": task.total_epochs,
                "loss": task.loss,
                "created_at": task.created_at,
                "started_at": task.started_at,
                "completed_at": task.completed_at
            }
            for task in self.tasks.values()
        ]
    
    def update_task_progress(
        self,
        task_id: str,
        epoch: int,
        progress: float,
        loss: Optional[float] = None
    ):
        """
        更新任务进度
        
        Args:
            task_id: 任务ID
            epoch: 当前轮次
            progress: 进度百分比
            loss: 损失值
        """
        task = self.tasks.get(task_id)
        if task:
            task.current_epoch = epoch
            task.progress = progress
            if loss is not None:
                task.loss = loss


class TrainingProgressCallback(TrainerCallback):
    """训练进度回调"""
    
    def __init__(self, task_id: str, trainer: LoRATrainer):
        super().__init__()
        self.task_id = task_id
        self.trainer = trainer
    
    def on_log(self, args, state, control, logs=None, **kwargs):
        """日志回调"""
        if logs:
            epoch = state.epoch if hasattr(state, 'epoch') else 0
            progress = (state.global_step / state.max_steps * 100) if state.max_steps > 0 else 0
            loss = logs.get("loss")
            
            self.trainer.update_task_progress(self.task_id, int(epoch), progress, loss)

