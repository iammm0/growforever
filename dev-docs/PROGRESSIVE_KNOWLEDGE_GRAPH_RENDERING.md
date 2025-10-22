# 渐进式知识图谱渲染系统

## 功能概述

实现了像茂密生长的树一样的知识图谱渲染系统，通过渐进式算法逐步渲染节点和边，每个元素都有独特的生长动画效果。

## 核心特性

### 1. **渐进式渲染算法**
- **节点渲染**: 按顺序逐个渲染节点，每个节点间隔300ms
- **边渲染**: 在节点渲染后，延迟200ms渲染相关边
- **生长标记**: 使用`isGrowing`标记控制动画状态

### 2. **树状生长动画**

#### 节点生长动画
```typescript
// 三个动画阶段
const animationPhase = 'entering' | 'growing' | 'stable'

// 进入阶段：从0开始，带旋转
transform: scale(0) rotate(-10deg)
opacity: 0

// 生长阶段：放大并发光
transform: scale(1.1) rotate(2deg)
filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.9))

// 稳定阶段：正常大小
transform: scale(1) rotate(0deg)
opacity: 1
```

#### 边连接动画
```typescript
// 路径生长效果
stroke-dasharray: 0 1000 → 1000 0
opacity: 0 → 1
stroke: 从透明到绿色
```

### 3. **自定义组件**

#### GrowingThoughtNode
- **生长状态管理**: 根据`isGrowing`属性控制动画
- **视觉反馈**: 发光效果、缩放动画、旋转效果
- **状态指示**: 生长中的节点有特殊的视觉标识

#### GrowingConnectionLine
- **路径动画**: 使用`stroke-dasharray`实现路径绘制效果
- **发光效果**: 生长中的边有绿色发光
- **标签动画**: 边标签在路径完成后显示

### 4. **渲染流程**

```typescript
// 1. 开始渐进式渲染
startProgressiveRendering(gnnNodes, gnnEdges)

// 2. 转换数据格式
const processedNodes = gnnNodes.map(node => ({
  type: 'growing-thought',
  data: { ...node, isGrowing: true }
}))

// 3. 逐个渲染节点
for (let i = 0; i < processedNodes.length; i++) {
  // 添加节点到画布
  setNodes(prevNodes => [...prevNodes, node])
  
  // 等待动画完成
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 渲染相关边
  const relatedEdges = processedEdges.filter(edge => 
    edge.source === node.id || edge.target === node.id
  )
  
  for (const edge of relatedEdges) {
    setEdges(prevEdges => [...prevEdges, edge])
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

// 4. 完成渲染，移除生长标记
setNodes(prevNodes => prevNodes.map(node => ({
  ...node,
  data: { ...node.data, isGrowing: false }
})))
```

## 技术实现

### 1. **状态管理**
```typescript
const [isProgressiveRendering, setIsProgressiveRendering] = useState(false)
const [pendingNodes, setPendingNodes] = useState<any[]>([])
const [pendingEdges, setPendingEdges] = useState<any[]>([])
const [renderedNodes, setRenderedNodes] = useState<string[]>([])
const [renderedEdges, setRenderedEdges] = useState<string[]>([])
```

### 2. **自定义类型注册**
```typescript
const customNodeTypes = {
  ...nodeTypes,
  'growing-thought': GrowingThoughtNode,
}

const customEdgeTypes = {
  'growing-connection': GrowingConnectionLine,
}
```

### 3. **CSS动画**
```css
@keyframes nodeGrow {
  0% { transform: scale(0) rotate(-10deg); opacity: 0; }
  50% { transform: scale(1.1) rotate(2deg); opacity: 0.8; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes edgeGrow {
  0% { stroke-dasharray: 0 1000; opacity: 0; }
  100% { stroke-dasharray: 1000 0; opacity: 1; }
}

@keyframes glowPulse {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.6)); }
  50% { filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.9)); }
}
```

## 用户体验

### 1. **视觉层次**
- 节点按顺序出现，形成层次感
- 边在节点后出现，建立连接关系
- 发光效果突出正在生长的元素

### 2. **动画节奏**
- **节点间隔**: 300ms，给用户足够时间观察
- **边延迟**: 200ms，确保节点动画完成后再连接
- **总时长**: 根据节点数量动态调整

### 3. **交互反馈**
- 生长中的节点有特殊视觉标识
- 边连接时有路径绘制动画
- 完成后移除生长标记，恢复正常状态

## 性能优化

### 1. **动画优化**
- 使用CSS3硬件加速
- 合理的动画时长避免卡顿
- 及时清理状态

### 2. **内存管理**
- 及时清理临时状态
- 避免不必要的重渲染
- 使用useCallback优化函数

### 3. **渲染优化**
- 分批渲染避免阻塞
- 使用setTimeout控制渲染节奏
- 异步处理避免UI冻结

## 扩展性

### 1. **动画自定义**
- 可调整渲染间隔
- 可自定义动画效果
- 支持不同的生长模式

### 2. **布局算法**
- 支持不同的节点布局
- 可扩展的边连接策略
- 自适应画布大小

### 3. **主题支持**
- 支持明暗主题
- 可自定义颜色方案
- 响应式设计

## 使用示例

```typescript
// 在GraphCanvas中使用
const handleGNNProcess = async (text: string) => {
  const response = await fetch('/api/gnn', {
    method: 'POST',
    body: JSON.stringify({ text, seedId: 1 })
  })
  
  const gnnData = await response.json()
  const { nodes: gnnNodes, edges: gnnEdges } = gnnData
  
  // 开始渐进式渲染
  await startProgressiveRendering(gnnNodes, gnnEdges)
}
```

## 效果展示

1. **种子节点**: 用户点击种子节点，输入文本
2. **文本扩展**: 调用LLM扩展文本内容
3. **GNN处理**: 发送到GNN服务进行实体关系识别
4. **渐进渲染**: 像树一样逐步生长出知识图谱
5. **动画完成**: 所有节点和边渲染完成，形成完整的知识图谱

这个系统让知识图谱的生成过程变得生动有趣，用户可以看到知识是如何像树一样逐步生长和连接的。
