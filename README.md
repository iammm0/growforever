# 前端模块说明

本文档详尽描述 GrowForever 前端的目录结构与模块间的联系，便于快速理解各部分职责与数据流。

## 目录结构

```
web/
├── app/              # Next.js App Router 页面与布局
├── components/       # UI 组件，按功能划分为 app/、graph/、overall/
├── context/          # React 上下文，如主题切换等全局状态
├── hooks/            # 自定义 Hook，与后端 API 和业务逻辑交互
├── lib/              # 通用库：HTTP 封装、图状态管理、数据模型与算法
├── public/           # 静态资源（图片、图标等）
├── styles/           # CSS Modules 与全局样式
├── types/            # TypeScript 类型定义，描述图节点、边及应用状态
└── package.json      # 前端依赖与脚本
```

## 模块关系

- **app**：作为入口层，组合各类组件并连接全局状态。
- **components**：提供页面可复用的 UI 单元；`graph/GraphCanvas` 读取 `lib/graphStore` 中的节点与边渲染图谱。
- **context**：例如 `ThemeContext`，向全局提供主题信息，供组件调用以实现暗/亮模式切换。
- **lib**：封装核心逻辑；`graphStore` 基于 Zustand 管理图状态，`node.ts`、`edge.ts` 等定义数据结构与辅助函数。
- **types**：集中定义 `GraphNode`、`GraphEdge` 等接口，确保模块间数据类型一致。
- **styles** 与 **public**：分别存放样式与静态资源，被组件按需引用。

## 数据流概述

1. 用户在 `app/graph/page.tsx` 打开图谱页面，`GraphCanvas` 组件加载。
2. `GraphCanvas` 通过 `useGraphStore` 读取/更新图节点与边。
3. 组件触发操作时调用 `useSeedApi`，该 Hook 使用 `lib/api.ts` 请求后端并更新状态。
4. 全局主题由 `ThemeContext` 提供，所有组件可订阅以响应模式切换。

以上结构使前端各层职责清晰：页面 <-> 组件 <-> Hook/Context <-> Lib/Store，共同构建图谱交互体验。
