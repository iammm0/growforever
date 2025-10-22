# GrowForever - 永恒之森

> 模糊意味着复杂，精确意味着简单。  
> Ambiguity breeds difficulty; Precision fosters simplicity.

一个基于 AI 的思维图谱构建工具，通过图结构管理和大模型生成能力，打造类人智能认知体验。从一颗想法的种子开始，让思维在永恒之森中自由生长。

## 🌟 项目特色

### 核心功能
- **思维种子播种**：从一个想法开始，自动展开思维的枝叶
- **多维连接探索**：探索一个事物与多个领域的交汇点，让复杂变清晰
- **三种成长模式**：自由、狂暴、手动模式，模拟不同的思维节奏
- **实时视觉反馈**：每个节点都是认知的一部分，实时可视化思考路径
- **AI 文本扩展**：结合大模型生成能力与结构化思维管理

### 技术亮点
- **图结构 AI**：融合 GPT 与图神经网络，智能拆解心理活动
- **多数据库架构**：PostgreSQL + Neo4j + Qdrant 三重存储
- **现代前端技术栈**：Next.js 15 + ReactFlow + Framer Motion
- **响应式设计**：支持桌面端和移动端，优雅的黑白主题

## 🚀 快速开始

### 环境要求
- Node.js 22+ 
- Docker & Docker Compose
- PostgreSQL 数据库
- Neo4j 图数据库
- Qdrant 向量数据库

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd growforever-web
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
创建 `.env.local` 文件：
```env
# 数据库配置
DATABASE_URL="postgresql://postgres:password@localhost:5432/growforever"
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=growforever
POSTGRES_PORT=5432

# Neo4j 配置
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Qdrant 配置
QDRANT_URL="http://localhost:6333"
QDRANT_COLLECTION="growforever"
QDRANT_VECTOR_SIZE=1536
QDRANT_DISTANCE=Cosine

# 其他配置
NODE_ENV=development
```

4. **启动数据库服务**
```bash
docker-compose up -d
```

5. **初始化数据库**
```bash
# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push
```

6. **启动开发服务器**
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

## 📁 项目结构

```
growforever-web/
├── algo/                    # 算法核心
│   ├── edge.ts            # 边关系处理
│   ├── emotion-cache.ts   # 情感缓存
│   ├── graph-store.ts     # 图状态管理
│   ├── node.ts            # 节点处理
│   ├── seed.ts            # 种子管理
│   └── auto-expand.ts  # 自动扩展模拟
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── edges/        # 边操作 API
│   │   ├── expand/       # 扩展 API
│   │   ├── infra/        # 基础设施 API
│   │   ├── nodes/        # 节点操作 API
│   │   ├── search/       # 搜索 API
│   │   └── seeds/        # 种子管理 API
│   ├── graph/            # 图谱页面
│   ├── expand/           # 文本扩展页面
│   └── layout.tsx        # 根布局
├── components/            # React 组件
│   ├── graph/            # 图谱相关组件
│   │   ├── graph-canvas.tsx      # 主画布
│   │   ├── thought-card.tsx     # 思维卡片
│   │   ├── control-panel.tsx    # 控制面板
│   │   └── expand-options-popover.tsx  # 扩展选项
│   └── ui/               # 通用 UI 组件
├── lib/                  # 工具库
│   ├── db.ts            # 数据库连接
│   ├── neo4j.ts         # Neo4j 操作
│   ├── qdrant.ts        # Qdrant 向量数据库
│   └── embedding.ts     # 向量嵌入
├── hooks/               # 自定义 Hooks
├── types/               # TypeScript 类型定义
├── styles/              # CSS 模块样式
└── prisma/              # 数据库模式
```

## 🎯 核心功能详解

### 1. 思维图谱构建

**种子创建**
- 用户输入一个想法作为根节点
- 系统自动分析并生成相关概念
- 支持多种节点类型：想法、记忆、情感、特征、事件

**自动扩展**
- **自由模式**：温和的自动扩展，适合深度思考
- **狂暴模式**：快速爆发式扩展，适合脑暴
- **手动模式**：完全手动控制，精确操作

**节点关系**
- 因果关系：A 导致 B
- 时序关系：A 在 B 之前
- 关联关系：A 与 B 相关
- 用户自定义关系

### 2. AI 文本扩展

**多种模式**
- **改写模式**：保持原意，优化表达
- **续写模式**：延续风格，扩展内容
- **摘要模式**：提炼要点，精简表达

**高级功能**
- 流式输出：实时显示生成过程
- 参数调节：温度、最大长度等
- 提示词优化：智能提示词生成
- 批量处理：支持大量文本处理

### 3. 数据存储架构

**PostgreSQL (Prisma)**
- 存储基础数据：种子、节点、边
- 支持复杂查询和事务
- 数据一致性和完整性

**Neo4j 图数据库**
- 存储图结构关系
- 高效的图遍历算法
- 支持复杂图查询

**Qdrant 向量数据库**
- 存储文本向量嵌入
- 语义相似度搜索
- 支持高维向量操作

## 🛠️ 技术栈

### 前端技术
- **Next.js 15**：React 全栈框架，App Router
- **React 19**：最新 React 版本
- **TypeScript**：类型安全的 JavaScript
- **Tailwind CSS**：原子化 CSS 框架
- **Material-UI**：React 组件库
- **ReactFlow**：图可视化库
- **Framer Motion**：动画库
- **Zustand**：轻量级状态管理

### 后端技术
- **Next.js API Routes**：服务端 API
- **Prisma**：数据库 ORM
- **PostgreSQL**：关系型数据库
- **Neo4j**：图数据库
- **Qdrant**：向量数据库

### 开发工具
- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **Docker**：容器化部署
- **Turbopack**：快速构建工具

## 🎨 界面设计

### 设计理念
- **极简主义**：清晰的视觉层次，减少认知负担
- **响应式设计**：适配各种设备尺寸
- **暗色模式**：支持系统主题切换
- **流畅动画**：提升用户体验

### 主要页面
1. **首页**：产品介绍和功能展示
2. **图谱页面**：主要的思维图谱构建界面
3. **扩展页面**：AI 文本扩展工具
4. **设置页面**：个性化配置选项

## 🔧 开发指南

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

### 数据库操作
```bash
# 查看数据库状态
npx prisma studio

# 重置数据库
npx prisma db push --force-reset

# 生成 Prisma 客户端
npx prisma generate
```

### Docker 部署
```bash
# 构建镜像
docker build -t growforever-web .

# 运行容器
docker run -p 3000:3000 growforever-web
```

## 📊 性能优化

### 前端优化
- **代码分割**：按需加载组件
- **图片优化**：WebP 格式，懒加载
- **缓存策略**：合理的缓存配置
- **Bundle 分析**：优化打包体积

### 后端优化
- **数据库索引**：优化查询性能
- **连接池**：复用数据库连接
- **缓存机制**：减少重复计算
- **异步处理**：提升响应速度

## 🤝 贡献指南

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 编写单元测试
- 更新文档

## 📝 更新日志

### v1.0.0 (2025-10-21)
- 🎉 初始版本发布
- ✨ 思维图谱构建功能
- ✨ AI 文本扩展工具
- ✨ 三种成长模式
- ✨ 响应式设计
- ✨ 暗色模式支持

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**GrowForever** - 让思维在永恒之森中自由生长 🌱
