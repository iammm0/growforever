# 训练指南

本指南介绍如何使用GPT Service进行LoRA微调训练。

## 准备工作

### 1. 准备数据集

支持的数据格式：
- **JSON**: `[{"text": "..."}, ...]`
- **JSONL**: 每行一个JSON对象
- **TXT**: 每行一个文本样本

**示例数据集（JSON格式）：**
```json
[
  {"text": "用户：你好\n助手：你好！有什么可以帮助你的吗？"},
  {"text": "用户：介绍一下Python\n助手：Python是一种高级编程语言..."}
]
```

### 2. 选择基础模型

推荐使用以下模型：
- `Qwen/Qwen2-7B-Instruct`
- `Qwen/Qwen2-1.5B-Instruct` (轻量级)
- `meta-llama/Llama-2-7b-chat-hf`

### 3. 配置LoRA参数

在 `config/models.yaml` 中配置LoRA参数：

```yaml
lora_config:
  r: 16                    # LoRA rank
  lora_alpha: 32           # LoRA alpha
  target_modules:          # 目标模块
    - "q_proj"
    - "k_proj"
    - "v_proj"
    - "o_proj"
  lora_dropout: 0.05       # Dropout率
  bias: "none"             # 偏置处理
```

## 开始训练

### 使用API

```python
import requests

response = requests.post(
    "http://localhost:8000/train",
    json={
        "base_model": "Qwen/Qwen2-7B-Instruct",
        "dataset_path": "data/train.json",
        "output_dir": "models/checkpoints/my_task",
        "num_epochs": 3,
        "batch_size": 4,
        "learning_rate": 2e-4,
        "dataset_format": "json"
    }
)

task_id = response.json()["task_id"]
print(f"训练任务ID: {task_id}")
```

### 使用脚本

```bash
python scripts/train_lora.py \
  --base_model Qwen/Qwen2-7B-Instruct \
  --dataset_path data/train.json \
  --output_dir models/checkpoints/my_task \
  --num_epochs 3 \
  --batch_size 4 \
  --learning_rate 2e-4
```

## 监控训练进度

### 查询训练状态

```python
import requests
import time

task_id = "your-task-id"

while True:
    response = requests.get(f"http://localhost:8000/train/status/{task_id}")
    status = response.json()
    
    print(f"状态: {status['status']}, 进度: {status['progress']:.2f}%")
    
    if status["status"] in ["completed", "failed"]:
        break
    
    time.sleep(10)
```

### 查看训练历史

```python
response = requests.get("http://localhost:8000/train/history")
tasks = response.json()["tasks"]
for task in tasks:
    print(f"{task['task_id']}: {task['status']} - {task['progress']:.2f}%")
```

## 使用训练好的模型

训练完成后，LoRA适配器保存在 `output_dir/lora_adapter` 目录。

### 加载LoRA适配器

```python
import requests

# 加载带LoRA适配器的模型
response = requests.post(
    "http://localhost:8000/models/load",
    json={
        "model_name": "my-fine-tuned-model",
        "model_path": "Qwen/Qwen2-7B-Instruct",
        "lora_adapter": "models/checkpoints/my_task/lora_adapter"
    }
)
```

### 使用模型生成

```python
response = requests.post(
    "http://localhost:8000/generate",
    json={
        "prompt": "用户：你好\n助手：",
        "model_name": "my-fine-tuned-model",
        "max_tokens": 512
    }
)
print(response.json()["text"])
```

## 训练参数说明

### 基础参数

- `base_model`: 基础模型路径或HuggingFace模型ID
- `dataset_path`: 数据集文件路径
- `output_dir`: 输出目录（可选）
- `num_epochs`: 训练轮数（默认：3）
- `batch_size`: 批次大小（默认：4）
- `learning_rate`: 学习率（默认：2e-4）
- `dataset_format`: 数据集格式（json/jsonl/txt）

### 高级参数

在配置文件中可以设置：
- `gradient_accumulation_steps`: 梯度累积步数
- `warmup_steps`: 预热步数
- `save_steps`: 保存检查点的步数
- `eval_steps`: 评估步数
- `max_grad_norm`: 梯度裁剪
- `fp16`: 是否使用FP16混合精度

## 最佳实践

### 1. 数据集准备

- 确保数据质量高、格式统一
- 建议训练集至少1000条样本
- 保留10%数据作为验证集

### 2. 超参数调优

- **学习率**: 从2e-4开始，根据loss调整
- **批次大小**: 根据GPU内存调整（4-8）
- **LoRA rank**: 从8开始，逐步增加到16或32
- **训练轮数**: 3-5轮通常足够

### 3. 监控指标

- **Loss**: 应该持续下降
- **验证Loss**: 如果上升，可能过拟合
- **生成质量**: 定期检查生成样本

### 4. 资源管理

- 使用FP16混合精度训练节省显存
- 调整`gradient_accumulation_steps`模拟更大批次
- 定期保存检查点

## 常见问题

### Q: 训练时显存不足？

A: 
- 减小`batch_size`
- 增加`gradient_accumulation_steps`
- 使用更小的模型（如1.5B）
- 启用FP16

### Q: 训练loss不下降？

A:
- 检查学习率是否合适
- 检查数据集质量
- 尝试增加LoRA rank

### Q: 如何恢复训练？

A: 当前版本不支持断点续训，建议使用较小的`save_steps`保存检查点。

## 下一步

训练完成后，可以：
1. 评估模型性能（使用`/evaluate`接口）
2. 部署模型到生产环境
3. 继续微调优化

