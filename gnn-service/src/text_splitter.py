"""
智能文本分割模块

基于训练好的模型，根据语义/心理活动变化进行文本分割。
"""

import logging
import os
import json
import torch
from typing import List, Tuple, Optional, Dict, Any
from transformers import AutoTokenizer, AutoModel
import torch.nn as nn

logger = logging.getLogger(__name__)


class TextSplitterModel(nn.Module):
    """文本分割模型"""
    
    def __init__(self, model_name: str = "bert-base-chinese", num_labels: int = 2):
        super(TextSplitterModel, self).__init__()
        self.bert = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.1)
        self.classifier = nn.Linear(self.bert.config.hidden_size, num_labels)
        
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        sequence_output = outputs.last_hidden_state
        sequence_output = self.dropout(sequence_output)
        logits = self.classifier(sequence_output)
        return logits


class SemanticTextSplitter:
    """基于语义的文本分割器"""
    
    def __init__(self, model_path: Optional[str] = None):
        """
        初始化文本分割器
        
        Args:
            model_path: 训练好的模型路径，如果为None则使用规则分割
        """
        self.model_path = model_path or "models/text_splitter"
        self.model = None
        self.tokenizer = None
        self.use_model = False
        
        if model_path and os.path.exists(model_path):
            try:
                self._load_model()
                self.use_model = True
                logger.info(f"已加载文本分割模型: {model_path}")
            except Exception as e:
                logger.warning(f"加载文本分割模型失败: {e}，将使用规则分割")
                self.use_model = False
        else:
            logger.info("未找到训练好的模型，使用规则分割")
    
    def _load_model(self):
        """加载模型"""
        # 加载tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        
        # 加载模型配置
        config_path = os.path.join(self.model_path, "config.json")
        if os.path.exists(config_path):
            import json
            with open(config_path, 'r') as f:
                config = json.load(f)
            base_model = config.get('base_model', 'bert-base-chinese')
        else:
            base_model = 'bert-base-chinese'
        
        # 初始化模型
        self.model = TextSplitterModel(base_model)
        
        # 加载权重
        model_file = os.path.join(self.model_path, "pytorch_model.bin")
        if os.path.exists(model_file):
            self.model.load_state_dict(torch.load(model_file, map_location='cpu'))
        
        self.model.eval()
        
        # 移动到GPU（如果可用）
        if torch.cuda.is_available():
            self.model = self.model.cuda()
    
    def split_by_semantic_chunks(self, text: str, graph_data: Optional[Dict[str, Any]] = None) -> List[Tuple[str, int]]:
        """
        根据语义/心理活动变化分割文本
        
        如果提供了图数据，可以从图中提取分割点。
        如果模型已加载，使用模型预测分割点。
        否则使用规则分割。
        
        Args:
            text: 输入文本
            graph_data: 图数据（包含节点和边），用于提取分割点
            
        Returns:
            文本块列表，每个元素为 (chunk_text, start_position)
        """
        if graph_data:
            # 从图数据中提取分割点
            split_points = self._extract_split_points_from_graph(text, graph_data)
            if split_points:
                return self._split_by_points(text, split_points)
        
        if self.use_model and self.model:
            # 使用模型预测分割点
            split_points = self._predict_split_points(text)
            if split_points:
                return self._split_by_points(text, split_points)
        
        # 使用规则分割（回退方案）
        return self._rule_based_split(text)
    
    def _extract_split_points_from_graph(self, text: str, graph_data: Dict[str, Any]) -> List[int]:
        """
        从图数据中提取分割点
        
        根据图的节点分布，识别语义变化点。
        
        Args:
            text: 原始文本
            graph_data: 图数据
            
        Returns:
            分割点位置列表
        """
        nodes = graph_data.get('nodes', [])
        if not nodes:
            return []
        
        # 提取节点在文本中的位置
        node_positions = []
        for node in nodes:
            node_id = node.get('id', '')
            # 在文本中查找节点文本的位置
            if node_id in text:
                pos = text.find(node_id)
                if pos != -1:
                    node_positions.append(pos)
        
        # 根据节点位置分布，识别语义变化点
        # 如果节点位置之间有较大间隔，可能是分割点
        if len(node_positions) < 2:
            return []
        
        node_positions.sort()
        split_points = []
        
        # 计算节点之间的间隔
        for i in range(len(node_positions) - 1):
            gap = node_positions[i + 1] - node_positions[i]
            # 如果间隔大于阈值（如100个字符），可能是分割点
            if gap > 100:
                # 在间隔中间位置作为分割点
                split_point = node_positions[i] + gap // 2
                split_points.append(split_point)
        
        return split_points
    
    def _predict_split_points(self, text: str) -> List[int]:
        """
        使用模型预测分割点
        
        Args:
            text: 输入文本
            
        Returns:
            分割点位置列表
        """
        if not self.model or not self.tokenizer:
            return []
        
        # 如果文本太长，需要分段处理
        max_length = 512
        if len(text) <= max_length:
            return self._predict_single_text(text)
        else:
            # 分段处理长文本
            split_points = []
            start = 0
            while start < len(text):
                end = min(start + max_length, len(text))
                chunk = text[start:end]
                chunk_points = self._predict_single_text(chunk)
                # 调整位置偏移
                adjusted_points = [p + start for p in chunk_points]
                split_points.extend(adjusted_points)
                start = end
            return sorted(set(split_points))
    
    def _predict_single_text(self, text: str) -> List[int]:
        """预测单个文本的分割点"""
        # Tokenize
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=512,
            return_tensors='pt'
        )
        
        # 移动到GPU
        if torch.cuda.is_available():
            encoding = {k: v.cuda() for k, v in encoding.items()}
        
        # 预测
        with torch.no_grad():
            logits = self.model(
                input_ids=encoding['input_ids'],
                attention_mask=encoding['attention_mask']
            )
            predictions = torch.argmax(logits, dim=-1)
        
        # 提取分割点（预测为1的位置）
        split_token_positions = []
        for i, pred in enumerate(predictions[0]):
            if pred == 1 and i > 0 and i < len(text):  # 跳过CLS和SEP token
                # 将token位置转换为字符位置
                # 这里简化处理，实际需要精确映射
                char_pos = self._token_to_char_position(text, i, encoding['input_ids'][0])
                if char_pos is not None:
                    split_token_positions.append(char_pos)
        
        return split_token_positions
    
    def _token_to_char_position(self, text: str, token_idx: int, input_ids: torch.Tensor) -> Optional[int]:
        """
        将token位置转换为字符位置
        
        Args:
            text: 原始文本
            token_idx: token索引
            input_ids: tokenized的input_ids
            
        Returns:
            字符位置，如果无法映射则返回None
        """
        # 简化实现：使用近似映射
        # 实际应该使用tokenizer的offset_mapping
        try:
            # 获取token对应的文本
            token_id = input_ids[token_idx].item()
            token_text = self.tokenizer.decode([token_id])
            
            # 在文本中查找该token的位置
            # 这是一个简化实现，实际应该使用更精确的方法
            if token_text in text:
                return text.find(token_text)
        except:
            pass
        
        # 如果无法精确映射，使用近似方法
        # 假设token和字符的比例
        total_tokens = (input_ids != self.tokenizer.pad_token_id).sum().item()
        if total_tokens > 0:
            ratio = len(text) / total_tokens
            return int(token_idx * ratio)
        
        return None
    
    def _split_by_points(self, text: str, split_points: List[int]) -> List[Tuple[str, int]]:
        """
        根据分割点分割文本
        
        Args:
            text: 输入文本
            split_points: 分割点位置列表（已排序）
            
        Returns:
            文本块列表
        """
        if not split_points:
            return [(text, 0)]
        
        chunks = []
        start = 0
        
        for point in sorted(split_points):
            if point > start and point < len(text):
                chunks.append((text[start:point], start))
                start = point
        
        # 添加最后一块
        if start < len(text):
            chunks.append((text[start:], start))
        
        return chunks
    
    def _rule_based_split(self, text: str) -> List[Tuple[str, int]]:
        """
        基于规则的文本分割（回退方案）
        
        根据标点符号和语义标记进行分割。
        
        Args:
            text: 输入文本
            
        Returns:
            文本块列表
        """
        # 语义变化标记（心理活动变化）
        semantic_markers = [
            '？', '？',  # 疑问
            '！', '！',  # 感叹
            '。',  # 句号
            '是不是', '是否', '为什么', '怎么',  # 疑问词
            '也许', '可能', '应该', '如果',  # 推测词
            '但是', '然而', '不过',  # 转折词
        ]
        
        chunks = []
        start = 0
        current_chunk_start = 0
        
        i = 0
        while i < len(text):
            # 检查是否是语义变化点
            is_split_point = False
            
            # 检查标点符号
            if text[i] in ['？', '！', '。']:
                is_split_point = True
                split_pos = i + 1
            else:
                # 检查语义标记
                for marker in semantic_markers:
                    if text[i:i+len(marker)] == marker:
                        is_split_point = True
                        split_pos = i
                        break
                else:
                    i += 1
                    continue
            
            if is_split_point:
                # 如果当前块有足够内容，进行分割
                if split_pos - current_chunk_start > 20:  # 最小块大小
                    chunks.append((text[current_chunk_start:split_pos], current_chunk_start))
                    current_chunk_start = split_pos
                i = split_pos
            else:
                i += 1
        
        # 添加最后一块
        if current_chunk_start < len(text):
            chunks.append((text[current_chunk_start:], current_chunk_start))
        
        if not chunks:
            return [(text, 0)]
        
        return chunks


# 全局文本分割器实例
_text_splitter: Optional[SemanticTextSplitter] = None


def get_text_splitter(model_path: Optional[str] = None) -> SemanticTextSplitter:
    """获取文本分割器实例"""
    global _text_splitter
    if _text_splitter is None:
        _text_splitter = SemanticTextSplitter(model_path)
    return _text_splitter


def set_text_splitter(splitter: SemanticTextSplitter) -> None:
    """设置全局文本分割器实例。"""
    global _text_splitter
    _text_splitter = splitter
