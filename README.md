<p align="center">
  <img src="web/src/app/favicon.ico" alt="GrowForever Logo" width="200" />
</p>

# GrowForever（永恒之森）

[![version](https://img.shields.io/badge/version-v0.2.0-blue.svg)](https://github.com/iammm0/growforever-main/releases/tag/v0.2.0)
[![license](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 用图结构 AI 将个人创意与心理语义有机构建为认知森林

## 简介

GrowForever 是一个基于 GPT+GNN 的交互式软件系统，利用图神经网络和语言模型，将用户的想法、记忆与情感结构化存储并以可视化图谱呈现，帮助用户持续探索与管理个人认知网络。

## 技术架构

```plaintext
GrowForever/
├── api/               # 后端服务 (FastAPI)
│   ├── core/          # 核心配置与数据库连接
│   ├── models/        # SQLAlchemy 模型定义 (User, Seed, Node, Edge)
│   ├── routers/       # API 路由
│   ├── services/      # GPT, GNN, TGT 服务封装
│   └── utils/         # 安全、JWT、依赖注入等工具
├── web/               # 前端 (Next.js + React)
│   ├── src/           # 源码
│   ├── public/        # 静态资源
│   └── package.json   # 前端依赖
├── docker-compose.yml # 本地环境 (Postgres, Neo4j, Qdrant)
├── environment.yml    # Conda 环境 (学术模型)
├── LICENSE
└── README.md
```

## 核心模块

* **用户与权限**（FastAPI + PostgreSQL）

  * JWT 登录/刷新、OAuth2 密码模式
  * 用户、Seed 关联管理
* **循环文本-图结构**（TGT 模块）

  * `tgt_model`: Text→Graph→Text
* **GPT 服务切换**

  * 支持本地 HF 模型、OpenAI API、以及远程自定义服务
* **GNN 服务切换**

  * 支持本地 Graph Transformer、远程自定义服务
* **图数据存储**（Neo4j + Qdrant）
* **前端交互**（Next.js 15 + ReactFlow + Framer Motion）

## 快速启动

1. 克隆仓库并进入目录：
```bash
git clone [https://github.com/iammm0/growforever-main.git](https://github.com/iammm0/growforever-main.git)
cd growforever-main
```


2. 配置环境变量（.env）：
```dotenv
# Postgres
env POSTGRES_HOST=postgres
# Neo4j
NEO4J_URI=bolt://neo4j:7687
# Qdrant
QDRANT_URL=http://qdrant:16333
# GPT/GNN
GPT_SERVICE_TYPE=default
GNN_SERVICE_TYPE=default
# JWT
SECRET_KEY=your-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
```

3. 启动依赖服务：
```bash
docker-compose up -d
```


4. 安装前端依赖并启动：
```bash
cd web
npm install
npm run dev
````

5. 启动后端 API：
```bash
cd api
conda activate growforever
conda env create -f api/environment.yml
conda env update -f api/environment.yml --prune
pip install -r requirements.txt
uvicorn main\:app --reload
```

## 前端开发

- `/src/app`：主要页面组件
- ReactFlow 拖拽图谱界面
- Zustand 管理全局应用状态

## 后端开发

- `/core/config.py`：Pydantic 设置读取 `.env`
- `/core/postgres.py`：SQLAlchemy 初始化
- `/core/neo4j.py` & `/core/qdrant.py`：图存储客户端
- `/models/graph.py`：Seed, Node, Edge, User 模型
- `/routers`：各模块路由（auth, seed, nodes, services, tests）
- `/services`：GPT, GNN, TGT 服务实现
- `/utils`: 安全、JWT、依赖注入

## 开发计划

| 阶段       | 内容                                    |
| ---------- | --------------------------------------- | 
| 1. 用户系统   | 完成 JWT 注册/登录/刷新与用户/Seed 关联   | 
| 2. TGT 模块  | 集成 text2graph2text 微调模型            |
| 3. 前端图谱   | 实现 ReactFlow 拖拽式图结构交互           |
| 4. 存储搭建   | 配置 Neo4j + Qdrant，完成健康检查 API      | 
| 5. 集成测试   | 端到端测试、性能调优、安全加固           |
| 6. 部署发布   | Docker 化、CI/CD、文档 & 演示            |

## 许可证

本项目采用 MIT 许可，详情见 [LICENSE](LICENSE)。

---

*作者：Mingjun Zhao*