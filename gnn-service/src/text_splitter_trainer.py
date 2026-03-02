"""
文本分割模型训练模块

基于BERT等预训练模型，训练一个能够根据语义/心理活动变化进行文本分割的模型。
"""

import logging
import os
import json
from typing import List, Tuple, Dict, Any, Optional
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoTokenizer, 
    AutoModel,
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np

logger = logging.getLogger(__name__)


class TextSplitDataset(Dataset):
    """文本分割训练数据集"""
    
    def __init__(self, texts: List[str], split_points: List[List[int]], tokenizer, max_length: int = 512):
        """
        初始化数据集
        
        Args:
            texts: 文本列表
            split_points: 每个文本的分割点位置列表（字符位置）
            tokenizer: tokenizer对象
            max_length: 最大序列长度
        """
        self.texts = texts
        self.split_points = split_points
        self.tokenizer = tokenizer
        self.max_length = max_length
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = self.texts[idx]
        split_points = set(self.split_points[idx])
        
        # Tokenize文本，获取offset_mapping用于字符到token的映射
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt',
            return_offsets_mapping=True  # 获取字符位置映射
        )
        
        # 创建标签：0表示不是分割点，1表示是分割点
        # 注意：CLS和SEP token的位置应该标记为-100（忽略）
        labels = torch.full((self.max_length,), -100, dtype=torch.long)
        
        # 获取offset_mapping（字符位置到token位置的映射）
        offset_mapping = encoding.pop('offset_mapping').squeeze(0)  # [seq_len, 2]
        
        # 标记分割点
        # offset_mapping[i] = [start_char, end_char] 表示第i个token对应的字符范围
        for char_pos in split_points:
            # 找到包含该字符位置的token
            for token_idx in range(len(offset_mapping)):
                start_char, end_char = offset_mapping[token_idx].tolist()
                # 检查字符位置是否在这个token的范围内
                if start_char <= char_pos < end_char:
                    if token_idx < self.max_length and token_idx > 0:  # 跳过CLS token
                        labels[token_idx] = 1
                    break
        
        # 对于非分割点的有效token位置，标记为0
        for token_idx in range(1, min(len(offset_mapping), self.max_length - 1)):  # 跳过CLS和SEP
            if labels[token_idx] == -100:  # 如果不是分割点
                start_char, end_char = offset_mapping[token_idx].tolist()
                if start_char != end_char:  # 有效的token（不是padding）
                    labels[token_idx] = 0
        
        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'labels': labels
        }


class TextSplitterModel(nn.Module):
    """文本分割模型"""
    
    def __init__(self, model_name: str = "bert-base-chinese", num_labels: int = 2):
        """
        初始化模型
        
        Args:
            model_name: 预训练模型名称
            num_labels: 标签数量（2：分割点/非分割点）
        """
        super(TextSplitterModel, self).__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_labels)
        
    def forward(self, input_ids, attention_mask, labels=None):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs.last_hidden_state
        sequence_output = self.dropout(sequence_output)
        logits = self.classifier(sequence_output)
        
        loss = None
        if labels is not None:
            loss_fct = nn.CrossEntropyLoss()
            # 忽略padding位置（label为-100）
            active_loss = attention_mask.view(-1) == 1
            active_logits = logits.view(-1, logits.size(-1))[active_loss]
            active_labels = labels.view(-1)[active_loss]
            loss = loss_fct(active_logits, active_labels)
        
        return {'loss': loss, 'logits': logits}
    
    @classmethod
    def from_pretrained(cls, model_path: str):
        """从预训练模型加载"""
        # 加载配置
        config_path = os.path.join(model_path, "config.json")
        if os.path.exists(config_path):
            import json
            with open(config_path, 'r') as f:
                config = json.load(f)
            model_name = config.get('base_model', 'bert-base-chinese')
        else:
            model_name = 'bert-base-chinese'
        
        model = cls(model_name)
        # 加载权重
        state_dict_path = os.path.join(model_path, "pytorch_model.bin")
        if os.path.exists(state_dict_path):
            model.load_state_dict(torch.load(state_dict_path, map_location='cpu'))
        return model


class TextSplitterTrainer:
    """文本分割模型训练器"""
    
    def __init__(self, model_name: str = "bert-base-chinese", output_dir: str = "models/text_splitter"):
        """
        初始化训练器
        
        Args:
            model_name: 预训练模型名称
            output_dir: 模型保存目录
        """
        self.model_name = model_name
        self.output_dir = output_dir
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = None
        
        # 确保输出目录存在
        os.makedirs(output_dir, exist_ok=True)
    
    def load_training_data(self, data_path: str) -> Tuple[List[str], List[List[int]]]:
        """
        加载训练数据
        
        数据格式：
        [
            {
                "text": "完整的长文本",
                "chunks": [
                    {"start": 0, "end": 50, "content": "第一段文本"},
                    {"start": 50, "end": 100, "content": "第二段文本"},
                    ...
                ]
            },
            ...
        ]
        
        Args:
            data_path: 训练数据文件路径（JSON格式）
            
        Returns:
            (texts, split_points) 元组
            - texts: 文本列表
            - split_points: 每个文本的分割点位置列表
        """
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        texts = []
        split_points = []
        
        for item in data:
            text = item['text']
            chunks = item.get('chunks', [])
            
            # 提取分割点（每个chunk的start位置，除了第一个）
            points = []
            for i, chunk in enumerate(chunks):
                if i > 0:  # 第一个chunk的start是0，不需要标记
                    points.append(chunk['start'])
            
            texts.append(text)
            split_points.append(points)
        
        logger.info(f"加载了 {len(texts)} 条训练数据")
        return texts, split_points
    
    def train(self, train_data_path: str, val_data_path: Optional[str] = None,
              epochs: int = 3, batch_size: int = 8, learning_rate: float = 2e-5):
        """
        训练模型
        
        Args:
            train_data_path: 训练数据路径
            val_data_path: 验证数据路径（可选）
            epochs: 训练轮数
            batch_size: 批次大小
            learning_rate: 学习率
        """
        logger.info("开始训练文本分割模型...")
        
        # 加载数据
        train_texts, train_split_points = self.load_training_data(train_data_path)
        train_dataset = TextSplitDataset(train_texts, train_split_points, self.tokenizer)
        
        val_dataset = None
        if val_data_path and os.path.exists(val_data_path):
            val_texts, val_split_points = self.load_training_data(val_data_path)
            val_dataset = TextSplitDataset(val_texts, val_split_points, self.tokenizer)
        
        # 初始化模型
        self.model = TextSplitterModel(self.model_name)
        
        # 训练参数
        training_args = TrainingArguments(
            output_dir=self.output_dir,
            num_train_epochs=epochs,
            per_device_train_batch_size=batch_size,
            per_device_eval_batch_size=batch_size,
            learning_rate=learning_rate,
            weight_decay=0.01,
            logging_dir=f'{self.output_dir}/logs',
            logging_steps=10,
            save_steps=100,
            eval_strategy="steps" if val_dataset else "no",  # 使用 eval_strategy 而不是 evaluation_strategy
            eval_steps=100 if val_dataset else None,
            load_best_model_at_end=True if val_dataset else False,
        )
        
        # 数据整理器
        data_collator = DataCollatorForTokenClassification(self.tokenizer)
        
        # 计算指标的函数
        def compute_metrics(eval_pred):
            predictions, labels = eval_pred
            predictions = np.argmax(predictions, axis=-1)
            
            # 展平
            predictions = predictions.flatten()
            labels = labels.flatten()
            
            # 移除padding位置（label为-100）
            mask = labels != -100
            predictions = predictions[mask]
            labels = labels[mask]
            
            accuracy = accuracy_score(labels, predictions)
            precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='binary')
            
            return {
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1': f1
            }
        
        # 创建Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=val_dataset,
            data_collator=data_collator,
            compute_metrics=compute_metrics if val_dataset else None,
        )
        
        # 开始训练
        trainer.train()
        
        # 保存模型
        trainer.save_model()
        self.tokenizer.save_pretrained(self.output_dir)
        
        # 保存模型配置
        self.save_model_config()
        
        # 保存模型权重
        model_path = os.path.join(self.output_dir, "pytorch_model.bin")
        torch.save(self.model.state_dict(), model_path)
        
        logger.info(f"模型训练完成，已保存到: {self.output_dir}")
    
    def save_model_config(self):
        """保存模型配置"""
        config = {
            'base_model': self.model_name,
            'num_labels': 2,
            'model_type': 'text_splitter'
        }
        config_path = os.path.join(self.output_dir, 'config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

