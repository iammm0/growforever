# API 文档

GPT Service 提供完整的RESTful API接口，支持文本生成、模型管理、训练和评估等功能。

## 基础信息

- **Base URL**: `http://localhost:8000`
- **API版本**: v1.0.0
- **Content-Type**: `application/json`

## 认证

当前版本不需要认证，生产环境建议添加认证机制。

## 端点列表

### 基础端点

#### GET `/`

获取服务信息。

**响应示例：**
```json
{
  "service": "GPT Service",
  "version": "1.0.0",
  "description": "推理模型服务 - 支持本地模型训练和Ollama代理",
  "environment": "dev",
  "endpoints": {...}
}
```

#### GET `/health`

健康检查接口。

**响应示例：**
```json
{
  "status": "healthy",
  "service": "gpt-service",
  "model_manager": true,
  "ollama_proxy": true,
  "trainer": true,
  "evaluator": true
}
```

### 模型管理

#### GET `/models`

获取所有已加载的模型列表。

**响应示例：**
```json
{
  "models": [
    {
      "name": "qwen2-7b-instruct",
      "type": "local",
      "device": "cuda",
      "lora_adapter": null,
      "is_current": true
    }
  ],
  "current_model": "qwen2-7b-instruct",
  "total_count": 1
}
```

#### GET `/models/{model_name}`

获取指定模型的详细信息。

#### POST `/models/load`

加载模型。

**请求体：**
```json
{
  "model_name": "qwen2-7b-instruct",
  "model_path": "Qwen/Qwen2-7B-Instruct",
  "lora_adapter": "models/lora/adapter1"
}
```

#### POST `/models/unload`

卸载模型。

**查询参数：**
- `model_name`: 模型名称

#### POST `/models/switch`

切换当前模型。

**查询参数：**
- `model_name`: 模型名称

### 文本生成

#### POST `/generate`

文本生成接口。

**请求体：**
```json
{
  "prompt": "你好，请介绍一下人工智能。",
  "model_name": "qwen2-7b-instruct",
  "max_tokens": 512,
  "temperature": 0.8,
  "top_p": 0.9,
  "repetition_penalty": 1.05,
  "use_ollama": false
}
```

**响应示例：**
```json
{
  "text": "人工智能（AI）是...",
  "model_name": "qwen2-7b-instruct",
  "tokens_generated": 150
}
```

#### POST `/generate/stream`

流式文本生成（SSE格式）。

**请求体：** 同 `/generate`

**响应：** Server-Sent Events流

#### POST `/chat`

对话接口。

**请求体：**
```json
{
  "messages": [
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮助你的吗？"},
    {"role": "user", "content": "介绍一下Python"}
  ],
  "model_name": "qwen2-7b-instruct",
  "max_tokens": 512,
  "temperature": 0.8,
  "use_ollama": false
}
```

#### POST `/batch`

批量生成。

**请求体：**
```json
{
  "prompts": [
    "什么是机器学习？",
    "什么是深度学习？"
  ],
  "model_name": "qwen2-7b-instruct",
  "max_tokens": 512,
  "temperature": 0.8
}
```

### 训练

#### POST `/train`

启动LoRA微调训练任务。

**请求体：**
```json
{
  "base_model": "Qwen/Qwen2-7B-Instruct",
  "dataset_path": "data/train.json",
  "output_dir": "models/checkpoints/task1",
  "num_epochs": 3,
  "batch_size": 4,
  "learning_rate": 2e-4,
  "dataset_format": "json"
}
```

**响应示例：**
```json
{
  "status": "success",
  "task_id": "uuid-string",
  "message": "训练任务已创建"
}
```

#### GET `/train/status/{task_id}`

获取训练任务状态。

**响应示例：**
```json
{
  "task_id": "uuid-string",
  "status": "running",
  "progress": 45.5,
  "current_epoch": 1,
  "total_epochs": 3,
  "loss": 0.123,
  "created_at": "2024-01-01T00:00:00",
  "started_at": "2024-01-01T00:01:00",
  "output_dir": "models/checkpoints/task1"
}
```

#### GET `/train/history`

获取训练历史。

### 评估

#### POST `/evaluate`

评估模型。

**请求体：**
```json
{
  "model_name": "qwen2-7b-instruct",
  "test_data": [
    {"input": "什么是AI？", "expected": "AI是人工智能的缩写..."}
  ],
  "metrics": ["perplexity", "exact_match", "bleu", "rouge"]
}
```

#### GET `/evaluate/results/{eval_id}`

获取评估结果。

### Ollama管理

#### GET `/ollama/models`

获取Ollama模型列表。

#### POST `/ollama/pull`

拉取Ollama模型。

**查询参数：**
- `model_name`: 模型名称

#### GET `/ollama/stats`

获取Ollama统计信息。

## 错误处理

所有错误响应遵循以下格式：

```json
{
  "detail": "错误描述"
}
```

常见HTTP状态码：
- `200`: 成功
- `400`: 请求参数错误
- `404`: 资源不存在
- `500`: 服务器内部错误

## 示例代码

### Python

```python
import requests

# 文本生成
response = requests.post(
    "http://localhost:8000/generate",
    json={
        "prompt": "你好，请介绍一下人工智能。",
        "max_tokens": 512
    }
)
print(response.json()["text"])

# 流式生成
response = requests.post(
    "http://localhost:8000/generate/stream",
    json={"prompt": "写一首诗"},
    stream=True
)
for line in response.iter_lines():
    if line:
        print(line.decode())
```

### cURL

```bash
# 文本生成
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "你好，请介绍一下人工智能。",
    "max_tokens": 512
  }'
```

## 交互式文档

访问 `http://localhost:8000/docs` 查看Swagger UI交互式文档。

