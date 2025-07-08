<p align="center">
  <img src="web/src/app/favicon.ico" alt="GrowForever Logo" width="200" />
</p>

# GrowForever（永恒之森）

[![version](https://img.shields.io/badge/version-v0.2.0-blue.svg)](https://github.com/iammm0/growforever-main/releases/tag/v0.2.0)
[![license](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> 用图结构 AI 将个人创意与心理语义有机构建为认知森林

## 简介

GrowForever 通过 GPT+GNN 混合模型与 Neo4j 图数据库，将用户输入的想法、经历与情感结构化为可视化知识图谱，帮助持续探索与管理个人认知网络。

## 核心功能

- **心理语义提取**：GPT 深度分析文本，生成结构化心理活动片段
- **图谱构建**：GNN 解构节点与关系，并评估关联强度
- **实时可视化**：ReactFlow + Framer Motion 拖拽式图谱交互
- **后端存储**：FastAPI 接口 + Neo4j 高效读写
- **流畅体验**：Zustand 全局状态管理，确保数据同步

## 技术栈

- **前端**：Next.js 15 (App Router), MUI
- **AI 模型**：PyTorch（GPT & GNN）
- **数据库**：Neo4j 图数据库
- **可视化**：ReactFlow, Framer Motion
- **状态管理**：Zustand

## 快速开始

```bash
git clone https://github.com/iammm0/growforever-main.git
cd growforever-main
npm install && pip install -r requirements.txt
docker-compose up
npm run dev
