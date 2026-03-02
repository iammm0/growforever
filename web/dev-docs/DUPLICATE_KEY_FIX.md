# 重复Key错误修复说明

## 问题描述

在渐进式知识图谱渲染过程中，出现了重复的React key错误：
```
Error: Encountered two children with the same key, `老-刘-1761116196682-tupswkgxi`. 
Keys should be unique so that components maintain their identity across updates.
```

## 问题原因

1. **节点ID冲突**: GNN服务返回的节点ID可能与现有节点ID重复
2. **边ID冲突**: 边ID也可能与现有边ID重复
3. **渐进式渲染**: 在渲染过程中，同一个边可能被多次添加

## 解决方案

### 1. **增强ID唯一性检查**

#### 节点ID处理
```typescript
// 创建节点ID映射和边ID映射
const nodeIdMap = new Map<string, string>()
const edgeIdMap = new Map<string, string>()
const existingNodeIds = new Set(nodes.map(node => node.id))
const existingEdgeIds = new Set(edges.map(edge => edge.id))

// 转换节点数据，确保ID唯一
const processedNodes = gnnNodes.map((gnnNode: any, index: number) => {
    let nodeId = gnnNode.id
    let counter = 1
    while (existingNodeIds.has(nodeId)) {
        nodeId = `${gnnNode.id}-${counter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        counter++
    }
    existingNodeIds.add(nodeId)
    nodeIdMap.set(gnnNode.id, nodeId)
    // ...
})
```

#### 边ID处理
```typescript
// 转换边数据，确保ID唯一
const processedEdges = gnnEdges.map((gnnEdge: any, index: number) => {
    let edgeId = gnnEdge.id
    let counter = 1
    while (existingEdgeIds.has(edgeId)) {
        edgeId = `${gnnEdge.id}-${counter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        counter++
    }
    existingEdgeIds.add(edgeId)
    edgeIdMap.set(gnnEdge.id, edgeId)
    // ...
})
```

### 2. **防止边重复添加**

#### 使用Set跟踪已渲染的边
```typescript
const renderNodesProgressively = useCallback(async (processedNodes: any[], processedEdges: any[]) => {
    const renderedEdgeIds = new Set<string>()
    
    for (let i = 0; i < processedNodes.length; i++) {
        const node = processedNodes[i]
        
        // 添加节点到画布
        setNodes(prevNodes => [...prevNodes, node])
        setStoreNodes(prevNodes => [...prevNodes, node])
        
        // 等待节点动画完成
        await new Promise(resolve => setTimeout(resolve, RENDER_DELAY))
        
        // 渲染与该节点相关的边
        const relatedEdges = processedEdges.filter(edge => 
            edge.source === node.id || edge.target === node.id
        )
        
        for (const edge of relatedEdges) {
            if (!renderedEdgeIds.has(edge.id)) {
                setEdges(prevEdges => [...prevEdges, edge])
                addEdgeToStore(edge)
                renderedEdgeIds.add(edge.id)
                
                // 边的渲染延迟
                await new Promise(resolve => setTimeout(resolve, EDGE_DELAY))
            }
        }
    }
}, [setNodes, setEdges, setStoreNodes, addEdgeToStore])
```

### 3. **ID生成策略**

#### 多重保障机制
1. **时间戳**: 使用`Date.now()`确保时间唯一性
2. **随机字符串**: 使用`Math.random().toString(36).substr(2, 9)`生成随机后缀
3. **计数器**: 使用递增计数器处理同名ID
4. **实时检查**: 在生成过程中实时检查ID是否已存在

#### ID格式
```
原始ID: 老-刘
生成ID: 老-刘-1-1761116196682-tupswkgxi
         ↑  ↑  ↑              ↑
         │  │  │              └─ 随机字符串
         │  │  └─ 时间戳
         │  └─ 计数器
         └─ 原始ID
```

## 技术细节

### 1. **ID冲突检测**
```typescript
// 检查现有ID
const existingNodeIds = new Set(nodes.map(node => node.id))
const existingEdgeIds = new Set(edges.map(edge => edge.id))

// 循环检查直到找到唯一ID
while (existingNodeIds.has(nodeId)) {
    nodeId = `${gnnNode.id}-${counter}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    counter++
}
```

### 2. **边重复添加防护**
```typescript
// 使用Set跟踪已渲染的边
const renderedEdgeIds = new Set<string>()

// 检查边是否已渲染
if (!renderedEdgeIds.has(edge.id)) {
    // 添加边
    setEdges(prevEdges => [...prevEdges, edge])
    addEdgeToStore(edge)
    renderedEdgeIds.add(edge.id)
}
```

### 3. **状态管理优化**
```typescript
// 移除对renderedEdges状态的依赖
const renderNodesProgressively = useCallback(async (processedNodes: any[], processedEdges: any[]) => {
    // 使用局部变量而不是状态
    const renderedEdgeIds = new Set<string>()
    // ...
}, [setNodes, setEdges, setStoreNodes, addEdgeToStore])
```

## 修复效果

### 1. **唯一性保证**
- 所有节点和边都有唯一的ID
- 避免React key冲突错误
- 确保组件正确渲染

### 2. **性能优化**
- 减少不必要的重渲染
- 避免重复添加相同的边
- 提高渲染效率

### 3. **稳定性提升**
- 消除控制台错误
- 确保渐进式渲染正常工作
- 提供更好的用户体验

## 测试验证

### 1. **ID唯一性测试**
```typescript
// 验证所有节点ID唯一
const nodeIds = nodes.map(node => node.id)
const uniqueNodeIds = new Set(nodeIds)
console.assert(nodeIds.length === uniqueNodeIds.size, '节点ID不唯一')

// 验证所有边ID唯一
const edgeIds = edges.map(edge => edge.id)
const uniqueEdgeIds = new Set(edgeIds)
console.assert(edgeIds.length === uniqueEdgeIds.size, '边ID不唯一')
```

### 2. **渐进式渲染测试**
- 多次调用GNN处理
- 验证没有重复的节点或边
- 确保动画效果正常

### 3. **边界情况测试**
- 相同名称的实体
- 大量节点和边
- 快速连续操作

## 总结

通过实施多重ID唯一性检查和边重复添加防护，成功解决了渐进式知识图谱渲染中的重复key错误。这个修复确保了：

1. **数据完整性**: 所有节点和边都有唯一标识
2. **渲染稳定性**: 避免React key冲突
3. **用户体验**: 流畅的渐进式动画效果
4. **系统可靠性**: 支持多次操作和复杂场景

现在知识图谱可以像茂密的树一样稳定地生长，每个节点和边都有独特的身份，确保渲染过程的流畅和稳定。
