# 生成节点放大查看功能实现

## 功能概述

实现了对通过GNN服务生成的节点（非种子节点）的放大查看功能，用户点击这些节点时会弹出预览弹窗显示详细信息。

## 实现细节

### 1. **节点类型区分**

#### 种子节点 (role: 'seed')
- **行为**: 点击时显示PromptDialog，用于文本扩展和GNN处理
- **用途**: 用户输入和知识图谱生成起点

#### 生成节点 (role: 'generated') 
- **行为**: 点击时显示预览弹窗，展示节点详细信息
- **用途**: 查看通过GNN服务生成的实体和关系信息

### 2. **渐进式渲染优化**

#### 节点数据完善
```typescript
// 完成渲染时，确保生成的节点支持放大查看
setNodes(prevNodes => prevNodes.map(node => {
    if (node.data?.role === 'generated') {
        return {
            ...node,
            data: {
                ...node.data,
                isGrowing: false,
                magnified: false, // 初始状态为未放大
                // 确保有description和expandedText用于预览
                description: node.data.description || `这是通过GNN服务生成的节点：${node.data.title}`,
                expandedText: node.data.expandedText || `节点 "${node.data.title}" 的详细信息将在这里显示。`
            }
        }
    }
    return node
}))
```

#### 数据保障
- **description**: 如果GNN服务没有提供，自动生成默认描述
- **expandedText**: 提供默认的扩展文本内容
- **magnified**: 初始状态设为false，支持后续放大操作

### 3. **点击事件处理**

#### 节点点击逻辑
```typescript
const onNodeClick = useCallback((event: React.MouseEvent, clickedNode: Node) => {
    const latestNode = nodes.find((node) => node.id === clickedNode.id) ?? clickedNode
    setSelectedNode(latestNode)

    // 种子节点：显示PromptDialog
    if (latestNode.data?.role === 'seed') {
        if (onPromptDialogOpen) {
            onPromptDialogOpen()
        } else {
            setInternalPromptDialogOpen(true)
        }
        return
    }

    // 生成节点：不显示扩展选项，让节点组件自己处理点击
    if (latestNode.data?.role === 'generated') {
        // 不显示扩展选项弹窗，让节点组件处理点击
        return
    }

    // 其他节点：显示扩展选项
    // ...
}, [dependencies])
```

#### 事件处理策略
- **种子节点**: 显示PromptDialog进行文本扩展和GNN处理
- **生成节点**: 不显示扩展选项，让ThoughtCard组件处理点击事件
- **其他节点**: 显示原有的扩展选项弹窗

### 4. **ThoughtCard组件支持**

#### 预览弹窗功能
- **点击触发**: 节点点击时显示预览弹窗
- **详细信息**: 展示description、expandedText、标签等
- **交互体验**: 流畅的动画和过渡效果

#### 节点显示优化
- **简洁布局**: 只显示标题、标签和角色指示器
- **放大按钮**: 右上角的眼睛图标
- **角色标识**: 显示"生成"标识

## 用户体验流程

### 1. **知识图谱生成**
1. 用户点击种子节点
2. 输入文本和提示词
3. 调用文本扩展API
4. 调用GNN服务进行实体关系识别
5. 渐进式渲染生成的节点

### 2. **生成节点查看**
1. 用户点击生成的节点
2. 弹出预览弹窗
3. 查看节点详细信息
4. 关闭弹窗继续操作

### 3. **视觉反馈**
- **节点状态**: 清晰的角色标识（种子/生成）
- **交互反馈**: 悬停和点击的视觉效果
- **动画过渡**: 流畅的弹窗显示和隐藏

## 技术实现

### 1. **状态管理**
```typescript
// 节点数据接口
interface ThoughtCardData {
    title: string
    description?: string
    expandedText?: string
    role?: 'seed' | 'generated' | 'normal'
    highlight?: boolean
    magnified?: boolean
    // ... 其他属性
}
```

### 2. **组件通信**
- **GraphCanvas**: 管理节点点击事件和状态
- **ThoughtCard**: 处理节点显示和预览弹窗
- **NodePreviewModal**: 显示详细的节点信息

### 3. **样式适配**
- **主题一致**: 符合项目绿色主题
- **暗色支持**: 完整的暗色模式适配
- **响应式**: 适配不同屏幕尺寸

## 功能特点

### 1. **智能区分**
- 自动识别节点类型
- 不同节点类型有不同的交互行为
- 保持原有功能的同时添加新功能

### 2. **数据保障**
- 确保生成节点有完整的预览数据
- 提供默认内容避免空白显示
- 支持动态数据更新

### 3. **用户体验**
- 直观的交互方式
- 清晰的信息层次
- 流畅的动画效果

## 使用场景

### 1. **知识图谱探索**
- 用户生成知识图谱后
- 点击任意生成节点查看详情
- 了解实体和关系的具体信息

### 2. **信息验证**
- 检查GNN服务的识别结果
- 验证实体和关系的准确性
- 补充或修正节点信息

### 3. **内容扩展**
- 查看节点的详细描述
- 了解扩展文本内容
- 获取更多上下文信息

## 总结

通过这个实现，用户现在可以：

1. **种子节点**: 用于输入和生成知识图谱
2. **生成节点**: 用于查看和探索生成的实体关系
3. **无缝切换**: 在不同节点类型间自然切换
4. **信息完整**: 获得完整的节点信息展示

这个功能让知识图谱的交互更加完整和用户友好，既保持了原有的生成功能，又增加了查看和探索的能力。
