# GNN Service API 文档

## 基础信息

- **Base URL**: `http://localhost:8000`
- **API版本**: v2.1.0
- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **服务描述**: 基于多模型的中文命名实体识别和知识图谱构建服务（支持智能文本分割和长文本）

## 接口列表

### 1. 文本处理接口（核心）

#### POST `/process_text/`

处理中文文本，进行命名实体识别和关系抽取，构建知识图谱。

**接口描述**：
- 支持长文本处理（最大10万字符）
- 支持多模型切换和策略选择
- 返回结构化的知识图谱数据（节点和边）
- 自动计算节点位置，便于前端可视化

---

## 📋 `/process_text/` 接口详解

### 请求信息

**请求方法**: `POST`

**请求路径**: `/process_text/`

**请求头**:
```
Content-Type: application/json
Accept: application/json
```

**请求体** (JSON):

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| text | string | ✅ 是 | - | 待处理的文本内容，1-100000字符 |
| model_name | string | ❌ 否 | null | 指定使用的模型名称，如果为null则使用默认模型 |
| strategy | string | ❌ 否 | "single" | 模型使用策略，可选值见下方说明 |

#### `text` 参数说明

- **类型**: `string`
- **必填**: 是
- **长度限制**: 1-100000 字符
- **说明**: 待处理的中文文本内容
- **示例**: 
  ```json
  "text": "张三在北京大学工作，李四是清华大学的学生。"
  ```

#### `model_name` 参数说明

- **类型**: `string` 或 `null`
- **必填**: 否
- **默认值**: `null`（使用配置的默认模型）
- **说明**: 指定使用的模型名称
- **可选值**: 
  - `"bert-base-chinese"` - BERT中文基础模型
  - `"roberta-base-chinese"` - RoBERTa中文模型
  - `"macbert-base-chinese"` - MacBERT中文模型
- **示例**: 
  ```json
  "model_name": "bert-base-chinese"
  ```
- **注意**: 如果不指定，将使用默认模型或根据strategy使用多模型

#### `strategy` 参数说明

- **类型**: `string`
- **必填**: 否
- **默认值**: `"single"`
- **说明**: 模型使用策略，控制如何组合多个模型的识别结果
- **可选值**:
  - `"single"` - 单模型模式（最快）
    - 如果指定了`model_name`，使用指定模型
    - 如果未指定，使用默认模型
  - `"vote"` - 多模型投票（准确率高）
    - 使用所有已启用的模型进行识别
    - 选择被至少一半模型识别的实体
  - `"union"` - 多模型并集（召回率高）
    - 使用所有已启用的模型进行识别
    - 取所有模型识别结果的并集
  - `"intersection"` - 多模型交集（精确率高）
    - 使用所有已启用的模型进行识别
    - 只保留所有模型都识别的实体
  - `"weighted"` - 加权集成（规划中）
- **示例**: 
  ```json
  "strategy": "vote"
  ```

### 请求示例

#### 示例1: 基本使用（单模型）

```json
{
  "text": "马云是阿里巴巴集团的创始人，阿里巴巴总部位于杭州。"
}
```

#### 示例2: 指定模型

```json
{
  "text": "清华大学位于北京，是一所著名的高等学府。",
  "model_name": "bert-base-chinese"
}
```

#### 示例3: 使用多模型投票策略

```json
{
  "text": "张三在北京大学工作，李四是清华大学的学生。",
  "strategy": "vote"
}
```

#### 示例4: 长文本处理

```json
{
  "text": "这是一段很长的文本内容，可能包含数千或数万字符...（实际内容）",
  "strategy": "union"
}
```

---

## 📤 响应格式

### 成功响应

**HTTP状态码**: `200 OK`

**响应体** (JSON):

```json
{
  "nodes": [
    {
      "id": "string",
      "type": "thought",
      "data": {
        "title": "string",
        "description": "string",
        "tags": ["string"],
        "highlight": boolean,
        "magnified": boolean,
        "label": "string"
      },
      "position": {
        "x": number,
        "y": number
      }
    }
  ],
  "edges": [
    {
      "source": "string",
      "target": "string",
      "relationship": "string",
      "data": {}
    }
  ],
  "stats": {
    "node_count": number,
    "edge_count": number,
    "is_connected": boolean
  }
}
```

### 响应字段详解

#### `nodes` 数组

知识图谱中的节点（实体）列表。

每个节点对象包含：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | string | 节点唯一标识符（实体文本） |
| type | string | 节点类型，固定为 `"thought"` |
| data | object | 节点数据对象 |
| position | object | 节点位置坐标 |

**`data` 对象字段**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| title | string | 节点标题（实体文本） |
| description | string | 节点描述信息 |
| tags | string[] | 标签列表（实体类型，如 `["PERSON"]`） |
| highlight | boolean | 是否高亮显示 |
| magnified | boolean | 是否放大显示 |
| label | string | 实体类型标签 |

**`position` 对象字段**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| x | number | X坐标（像素） |
| y | number | Y坐标（像素） |

#### `edges` 数组

知识图谱中的边（关系）列表。

每个边对象包含：

| 字段名 | 类型 | 说明 |
|--------|------|------|
| source | string | 源节点ID（实体文本） |
| target | string | 目标节点ID（实体文本） |
| relationship | string | 关系类型（如"工作于"、"位于"等） |
| data | object | 边的附加数据（可选） |

#### `stats` 对象

图谱统计信息。

| 字段名 | 类型 | 说明 |
|--------|------|------|
| node_count | number | 节点总数（实体数量） |
| edge_count | number | 边总数（关系数量） |
| is_connected | boolean | 图谱是否连通（所有节点是否通过边连接） |

### 完整响应示例

```json
{
  "nodes": [
    {
      "id": "张三",
      "type": "thought",
      "data": {
        "title": "张三",
        "description": "实体类型：PERSON，文本：张三",
        "tags": ["PERSON"],
        "highlight": true,
        "magnified": false,
        "label": "PERSON"
      },
      "position": {
        "x": 100.5,
        "y": 200.3
      }
    },
    {
      "id": "北京大学",
      "type": "thought",
      "data": {
        "title": "北京大学",
        "description": "实体类型：ORG，文本：北京大学",
        "tags": ["ORG"],
        "highlight": false,
        "magnified": false,
        "label": "ORG"
      },
      "position": {
        "x": 150.2,
        "y": 180.7
      }
    },
    {
      "id": "李四",
      "type": "thought",
      "data": {
        "title": "李四",
        "description": "实体类型：PERSON，文本：李四",
        "tags": ["PERSON"],
        "highlight": true,
        "magnified": false,
        "label": "PERSON"
      },
      "position": {
        "x": 120.8,
        "y": 220.1
      }
    },
    {
      "id": "清华大学",
      "type": "thought",
      "data": {
        "title": "清华大学",
        "description": "实体类型：ORG，文本：清华大学",
        "tags": ["ORG"],
        "highlight": false,
        "magnified": false,
        "label": "ORG"
      },
      "position": {
        "x": 170.3,
        "y": 210.5
      }
    }
  ],
  "edges": [
    {
      "source": "张三",
      "target": "北京大学",
      "relationship": "工作于",
      "data": {}
    },
    {
      "source": "李四",
      "target": "清华大学",
      "relationship": "就读于",
      "data": {}
    }
  ],
  "stats": {
    "node_count": 4,
    "edge_count": 2,
    "is_connected": false
  }
}
```

---

## ❌ 错误响应

### 错误响应格式

```json
{
  "detail": "string"
}
```

### 错误状态码

| HTTP状态码 | 说明 | 可能原因 |
|------------|------|----------|
| 400 | 请求参数错误 | 请求体格式错误、参数验证失败 |
| 422 | 数据验证失败 | 文本长度超出限制、必填参数缺失 |
| 500 | 服务器内部错误 | 模型加载失败、处理过程中出错 |
| 503 | 服务不可用 | 服务正在启动、模型加载中 |

### 错误响应示例

#### 400 Bad Request

```json
{
  "detail": [
    {
      "loc": ["body", "text"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "text"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

#### 500 Internal Server Error

```json
{
  "detail": "处理文本时发生错误: 模型加载失败"
}
```

---

## 📊 实体类型说明

系统可以识别以下实体类型：

| 实体类型 | 说明 | 示例 |
|---------|------|------|
| PERSON | 人名 | 张三、李四、马云 |
| ORG | 组织机构 | 北京大学、阿里巴巴、清华大学 |
| LOC | 地名 | 北京、上海、杭州 |
| TIME | 时间 | 2024年、今天、昨天 |
| MISC | 其他 | 其他未分类实体 |

---

## 🔗 关系类型说明

系统可以提取以下关系类型：

| 关系类型 | 说明 | 示例 |
|---------|------|------|
| 工作于 | 人物-机构关系 | 张三 工作于 北京大学 |
| 位于 | 位置关系 | 北京大学 位于 北京 |
| 就读于 | 人物-机构关系 | 李四 就读于 清华大学 |
| 属于 | 从属关系 | 某部门 属于 某公司 |
| 创建 | 创建关系 | 马云 创建 阿里巴巴 |
| 是 | 等同关系 | 北京 是 首都 |
| 与 | 通用关系 | 其他未明确关系 |

---

## 🤖 模型信息

### NER模型列表

服务支持以下NER模型（命名实体识别）：

| 模型名称 | 类型 | 描述 | 状态 |
|---------|------|------|------|
| bert-base-chinese | NER | BERT中文基础模型 | ✅ 已加载 |
| roberta-base-chinese | NER | RoBERTa中文模型（推荐，准确率较高） | ✅ 已加载 |
| macbert-base-chinese | NER | MacBERT中文模型 | ✅ 已加载 |
| bert-large-chinese | NER | BERT Large中文模型 | ⚠️ 可选 |
| roberta-large-chinese | NER | RoBERTa Large中文模型（需要更多GPU内存） | ⚠️ 可选 |

**注意**: 
- 所有模型在启动时自动加载并保存到本地 `models/` 目录
- HuggingFace模型会自动下载并保存到本地
- 模型加载状态可通过 `/models` 接口查询

### 文本分割模型

服务支持智能文本分割功能：

| 模型类型 | 状态 | 描述 |
|---------|------|------|
| text_splitter | ✅ 已训练 | 基于BERT的语义文本分割模型，能够根据心理活动变化进行文本分割 |

**功能说明**:
- 如果训练好的模型存在，会自动使用模型进行语义分割
- 如果模型不存在，会回退到基于规则的文本分割
- 文本分割状态可通过 `/text_splitter` 接口查询

**分割特点**:
- 基于语义/心理活动变化进行分割，而非简单的标点符号分割
- 能够识别心理活动转换、话题切换等语义变化点
- 适用于长文本处理，提高实体识别和关系抽取的准确性

---

## 📝 使用建议

### 1. 文本长度建议

- **短文本**（< 500字符）：使用默认策略 `single`，响应速度快
- **中等文本**（500-5000字符）：可以使用 `vote` 策略提高准确率
- **长文本**（> 5000字符）：系统会自动使用智能文本分割，建议使用 `union` 策略提高召回率

### 2. 模型选择建议

- **准确率优先**：使用 `vote` 策略（需要多个模型）
- **速度优先**：使用 `single` 策略，指定 `model_name` 为 `"bert-base-chinese"`
- **召回率优先**：使用 `union` 策略（需要多个模型）

### 3. 文本分割建议

- **长文本处理**：系统会自动使用训练好的文本分割模型（如果存在）
- **分割效果**：训练好的模型能够根据语义/心理活动变化进行更准确的分割
- **模型训练**：如需自定义分割规则，可使用 `/train_text_splitter/` 接口训练新模型

### 4. 性能优化建议

- 对于批量处理，建议使用异步请求
- 长文本处理可能需要较长时间，建议设置合理的超时时间
- 首次使用HuggingFace模型时会自动下载，需要网络连接
- 所有模型在启动时已加载，首次请求响应较快

### 5. 错误处理建议

- 始终检查HTTP状态码
- 处理500错误时，检查服务日志
- 对于422错误，检查请求参数是否符合要求
- 建议实现重试机制（对于网络错误）

---

## 🔍 其他相关接口

### GET `/health`

健康检查接口，用于检查服务是否正常运行。

**响应示例**:
```json
{
  "status": "healthy",
  "service": "gnn-service"
}
```

### GET `/models`

获取所有已加载的模型列表。

**响应示例**:
```json
{
  "models": [
    {
      "name": "bert-base-chinese",
      "type": "ner",
      "path": "models/bert-base-chinese",
      "device": "cuda"
    }
  ],
  "default_model": "bert-base-chinese",
  "default_strategy": "single",
  "total_count": 3
}
```

### GET `/models/{model_name}`

获取指定NER模型的详细信息。

**路径参数**:
- `model_name`: 模型名称（如：`bert-base-chinese`、`roberta-base-chinese`、`macbert-base-chinese`）

**响应示例**:
```json
{
  "name": "bert-base-chinese",
  "type": "ner",
  "path": "models/bert-base-chinese",
  "original_path": "models/bert-base-chinese",
  "device": "cuda",
  "status": "loaded"
}
```

### GET `/text_splitter`

获取文本分割模型信息。

**响应示例**:
```json
{
  "status": "loaded",
  "message": "使用训练好的模型",
  "model_path": "models/text_splitter",
  "use_model": true,
  "description": "基于BERT的语义文本分割模型，能够根据心理活动变化进行文本分割"
}
```

**状态说明**:
- `loaded`: 已加载训练好的模型
- `rule_based`: 使用规则分割（未找到训练好的模型）
- `not_initialized`: 文本分割器未初始化

### POST `/train_text_splitter/`

训练文本分割模型。

**请求体**:
```json
{
  "train_data_path": "docs/training_data_100.json",
  "val_data_path": "docs/val_data.json",
  "epochs": 3,
  "batch_size": 8,
  "learning_rate": 2e-5
}
```

**参数说明**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| train_data_path | string | ✅ 是 | 训练数据文件路径（JSON格式） |
| val_data_path | string | ❌ 否 | 验证数据文件路径（可选） |
| epochs | integer | ❌ 否 | 训练轮数（默认：3） |
| batch_size | integer | ❌ 否 | 批次大小（默认：8） |
| learning_rate | float | ❌ 否 | 学习率（默认：2e-5） |

**响应示例**:
```json
{
  "status": "success",
  "message": "模型训练完成",
  "model_path": "models/text_splitter"
}
```

---

## 📌 注意事项

1. **请求频率**: 建议控制请求频率，避免对服务器造成过大压力
2. **超时设置**: 长文本处理可能需要较长时间，建议设置30秒以上的超时时间
3. **字符编码**: 确保文本使用UTF-8编码
4. **模型加载**: 首次使用某模型时，如果模型需要从HuggingFace下载，需要较长时间
5. **GPU内存**: 使用多模型策略时，需要足够的GPU内存
6. **空结果处理**: 如果文本中未识别到实体，返回的`nodes`和`edges`数组为空

---

## 📞 技术支持

如有问题或建议，请：
- 查看服务日志获取详细错误信息
- 检查 `/health` 接口确认服务状态
- 检查 `/models` 接口确认模型加载状态
- 检查 `/text_splitter` 接口确认文本分割模型状态

---

## 📚 相关文档

- **训练数据格式**: 参考 `docs/training_data_example.json`
- **文本分割训练指南**: 参考 `docs/TEXT_SPLITTER_TRAINING.md`
- **项目结构**: 参考 `docs/PROJECT_STRUCTURE.md`

---

**文档版本**: v2.1.0  
**最后更新**: 2025-11-06

