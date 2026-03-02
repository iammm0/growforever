# GNN Service - 基于多模型的知识图谱构建服务

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个支持多模型切换和长文本处理的中文命名实体识别（NER）和知识图谱构建服务，使用FastAPI提供RESTful API接口。

## 📋 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API文档](#api文档)
- [配置说明](#配置说明)
- [使用示例](#使用示例)
- [常见问题](#常见问题)

## 🎯 项目简介

GNN Service是一个支持多模型和长文本处理的中文文本处理服务，主要功能包括：

- **多模型支持**：支持加载和切换多个NER模型（BERT、RoBERTa、MacBERT等）
- **多策略集成**：支持单模型、投票、并集等多种模型使用策略
- **长文本处理**：自动分块处理长文本，支持最大10万字符的文本
- **命名实体识别（NER）**：识别中文文本中的人名、地名、机构名等实体
- **关系抽取**：基于文本上下文提取实体之间的关系
- **知识图谱构建**：将识别出的实体和关系构建成知识图谱
- **RESTful API**：提供标准化的API接口，方便集成到其他系统

## ✨ 功能特性

### 核心功能
- ✅ **多模型支持**：可同时加载多个NER模型，支持动态切换
- ✅ **多策略集成**：
  - `single`：使用单个指定模型
  - `vote`：多模型投票，选择被至少一半模型识别的实体
  - `union`：多模型并集，取所有模型识别结果
  - `intersection`：多模型交集，只保留所有模型都识别的实体
  - `weighted`：加权集成（规划中）
- ✅ **长文本处理**：自动分块处理，支持最大10万字符的长文本
- ✅ **中文命名实体识别**：基于多种预训练模型的高精度中文实体识别
- ✅ **智能关系抽取**：基于文本上下文提取实体之间的关系
- ✅ **知识图谱构建**：使用NetworkX构建结构化知识图谱

### 技术特性
- ✅ **RESTful API**：基于FastAPI的高性能API服务
- ✅ **Docker支持**：提供完整的Docker部署方案
- ✅ **GPU加速**：支持GPU加速，大幅提升处理速度
- ✅ **错误处理**：完善的异常处理和日志记录
- ✅ **类型注解**：完整的Python类型注解支持
- ✅ **CORS支持**：支持跨域访问
- ✅ **健康检查**：提供健康检查接口
- ✅ **模型管理**：提供模型列表和详细信息查询接口

## 📁 项目结构

```
gnn-service/
├── main.py                    # 应用入口文件（根目录）
├── requirements.txt           # Python依赖包列表
├── Dockerfile                 # Docker构建文件
├── .gitignore                 # Git忽略文件
│
├── src/                       # 源代码目录
│   ├── __init__.py           # 包初始化文件
│   ├── config.py             # 配置文件（模型列表和系统参数）
│   ├── model_manager.py      # 模型管理器（多模型加载和策略管理）
│   ├── ner_re.py             # 命名实体识别和关系抽取模块
│   └── graph.py              # 知识图谱构建模块
│
├── models/                    # 模型文件目录
│   └── bert-base-chinese/    # BERT中文模型文件
│       ├── config.json
│       ├── model.safetensors
│       ├── tokenizer_config.json
│       └── vocab.txt
│
└── docs/                      # 文档目录
    ├── README.md             # 项目主要文档（本文件）
    ├── PROJECT_STRUCTURE.md  # 项目结构说明
    ├── CUDA_STATUS.md        # CUDA状态诊断文档
    ├── GPU_SETUP_COMPLETE.md # GPU配置完成文档
    └── models_config_example.json  # 模型配置示例
```

详细的项目结构说明请参考 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 🚀 快速开始

### 环境要求

- Python 3.10 或更高版本
- pip 包管理器
- 至少 4GB 可用内存（用于加载BERT模型）
- NVIDIA GPU（可选，推荐用于GPU加速）
- 可选：Docker（用于容器化部署）

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd gnn-service
```

#### 2. 创建虚拟环境（推荐）

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
```

#### 3. 安装依赖

```bash
pip install -r requirements.txt
```

#### 4. 安装GPU版本的PyTorch（推荐）

```bash
# 卸载CPU版本（如果已安装）
pip uninstall torch torchvision torchaudio

# 安装GPU版本（CUDA 12.4）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
```

#### 5. 准备模型

确保 `models/bert-base-chinese` 目录包含所有必需文件。其他模型（如RoBERTa）会在首次使用时自动从HuggingFace下载。

### 运行服务

```bash
python main.py
```

或者使用uvicorn：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后，访问：
- **API文档**：http://localhost:8000/docs
- **交互式API文档**：http://localhost:8000/redoc
- **健康检查**：http://localhost:8000/health

## 📚 API文档

### 基础信息

- **Base URL**: `http://localhost:8000`
- **API版本**: v2.0.0
- **Content-Type**: `application/json`

### 主要接口

#### 1. 处理文本

**POST** `/process_text/`

处理文本，进行命名实体识别和知识图谱构建。

**请求体**：

```json
{
  "text": "张三在北京大学工作，李四是清华大学的学生。",
  "model_name": "bert-base-chinese",
  "strategy": "single"
}
```

**响应示例**：

```json
{
  "nodes": [...],
  "edges": [...],
  "stats": {
    "node_count": 5,
    "edge_count": 4,
    "is_connected": true
  }
}
```

#### 2. 获取模型列表

**GET** `/models`

获取所有已加载的模型列表。

#### 3. 健康检查

**GET** `/health`

检查服务健康状态。

更多API文档请访问 http://localhost:8000/docs

## ⚙️ 配置说明

### 模型配置

编辑 `src/config.py` 文件来配置模型：

```python
MODEL_CONFIG = {
    "default_model": "bert-base-chinese",
    "default_strategy": "single",
    "models": [
        {
            "name": "bert-base-chinese",
            "path": "models/bert-base-chinese",  # 本地模型路径
            "type": "ner",
            "enabled": True,
        },
        {
            "name": "roberta-base-chinese",
            "path": "hfl/chinese-roberta-wwm-ext",  # HuggingFace模型
            "type": "ner",
            "enabled": True,
        },
    ],
}
```

### 长文本处理配置

```python
LONG_TEXT_CONFIG = {
    "max_text_length": 10000,  # 最大文本长度
    "chunk_size": 512,  # 分块大小
    "chunk_overlap": 50,  # 分块重叠大小
    "enable_long_text": True,  # 是否启用长文本处理
}
```

## 💡 使用示例

### Python示例

```python
import requests

url = "http://localhost:8000/process_text/"

# 使用多模型投票策略
data = {
    "text": "马云是阿里巴巴集团的创始人，阿里巴巴总部位于杭州。",
    "strategy": "vote"  # 使用投票策略
}

response = requests.post(url, json=data)
result = response.json()

print(f"识别到 {result['stats']['node_count']} 个实体")
print(f"提取到 {result['stats']['edge_count']} 个关系")
```

### cURL示例

```bash
curl -X POST "http://localhost:8000/process_text/" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "北京是中国的首都，上海是最大的城市。"
  }'
```

## ❓ 常见问题

### Q1: 如何添加更多模型？

**A**: 编辑 `src/config.py` 文件，在 `MODEL_CONFIG["models"]` 列表中添加新模型配置，并设置 `enabled: True`。

### Q2: 如何选择模型策略？

**A**: 通过API请求参数选择策略：
- `single`：使用单个模型（最快）
- `vote`：多模型投票（准确率高）
- `union`：多模型并集（召回率高）
- `intersection`：多模型交集（精确率高）

### Q3: CUDA不可用怎么办？

**A**: 请参考 [CUDA_STATUS.md](CUDA_STATUS.md) 进行排查。确保：
1. PyTorch版本包含CUDA支持（版本中包含+cu）
2. NVIDIA驱动正确安装
3. 在虚拟环境中安装了GPU版本的PyTorch

### Q4: 如何处理超长文本？

**A**: 系统已支持长文本处理，自动分块处理。可以通过 `src/config.py` 中的 `LONG_TEXT_CONFIG` 调整分块参数。

## 📝 更新日志

### v2.0.0 (2024-11-06)

- ✨ **新增多模型支持**：支持加载和切换多个NER模型
- ✨ **新增多策略集成**：支持单模型、投票、并集、交集等多种策略
- ✨ **新增长文本处理**：自动分块处理，支持最大10万字符的长文本
- ✨ **改进关系抽取**：基于文本上下文提取更精确的关系
- ✅ 添加GPU加速支持
- ✅ 优化项目结构，代码、文档、模型分类存放
- ✅ 完善API文档和类型注解

## 📄 许可证

本项目采用 MIT 许可证。

## 🙏 致谢

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的Web框架
- [Transformers](https://huggingface.co/transformers/) - Hugging Face的模型库
- [NetworkX](https://networkx.org/) - 图结构操作库
- [BERT-base-chinese](https://huggingface.co/bert-base-chinese) - 中文BERT模型

---

**注意**：本项目仅供学习和研究使用。在生产环境中使用前，请进行充分的测试和优化。
