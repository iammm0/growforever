# 统一PromptDialog架构说明

## 问题描述

之前存在两个独立的PromptDialog实例：
1. 控制面板触发的PromptDialog（在`app/graph/page.tsx`中）
2. 种子节点点击触发的PromptDialog（在`components/graph/graph-canvas.tsx`中）

这导致数据不共享，用户体验不一致。

## 解决方案

统一PromptDialog的管理，让所有触发方式都使用同一个PromptDialog实例，共享相同的数据和状态。

## 架构设计

### 1. **状态管理层次**
```
app/graph/page.tsx (顶层状态管理)
    ↓ props传递
components/graph/graph-canvas.tsx (PromptDialog实际渲染)
    ↓ 内部处理
components/graph/prompt-dialog.tsx (UI组件)
```

### 2. **触发方式**
- **控制面板触发**: `ControlPanel` → `page.tsx` → `GraphCanvas`
- **种子节点触发**: `GraphCanvas` 内部处理

### 3. **数据共享**
- 所有触发方式都使用同一个PromptDialog实例
- 共享相同的文本扩展和GNN处理逻辑
- 统一的状态管理和错误处理

## 技术实现

### GraphCanvas组件更新
```typescript
interface GraphCanvasProps {
    onPromptDialogOpen?: () => void
    onPromptDialogClose?: () => void
    promptDialogOpen?: boolean
}

export default function GraphCanvas({ 
    onPromptDialogOpen, 
    onPromptDialogClose, 
    promptDialogOpen: externalPromptDialogOpen 
}: GraphCanvasProps = {}) {
    // 使用外部传入的状态，如果没有则使用内部状态
    const promptDialogOpen = externalPromptDialogOpen !== undefined ? externalPromptDialogOpen : internalPromptDialogOpen
}
```

### 状态管理逻辑
```typescript
// 种子节点点击
if (isSeed) {
    if (onPromptDialogOpen) {
        onPromptDialogOpen()  // 外部控制
    } else {
        setInternalPromptDialogOpen(true)  // 内部控制
    }
    return
}

// PromptDialog关闭
onClose={() => {
    if (onPromptDialogClose) {
        onPromptDialogClose()  // 外部控制
    } else {
        setInternalPromptDialogOpen(false)  // 内部控制
    }
    setSelectedNode(null)
}}
```

### 页面级集成
```typescript
// app/graph/page.tsx
<GraphCanvas 
    promptDialogOpen={openPromptDialog}
    onPromptDialogOpen={handlePromptOpen}
    onPromptDialogClose={handlePromptClose}
/>
```

## 用户体验改进

### 1. **数据一致性**
- 无论从哪个入口打开，PromptDialog都显示相同的数据
- 文本扩展和GNN处理结果在所有入口间共享

### 2. **状态同步**
- 控制面板和种子节点触发的PromptDialog状态完全同步
- 关闭一个入口的PromptDialog，另一个入口也会同步关闭

### 3. **操作一致性**
- 所有入口都提供相同的功能
- 统一的错误处理和加载状态

## 兼容性保证

### 1. **向后兼容**
- GraphCanvas组件支持无props调用（使用内部状态）
- 保持原有的API接口不变

### 2. **灵活配置**
- 支持外部控制（页面级管理）
- 支持内部控制（组件级管理）

### 3. **渐进式升级**
- 现有代码无需大幅修改
- 可以逐步迁移到新的架构

## 使用方式

### 方式1：页面级控制（推荐）
```typescript
// 在页面组件中
const [openPromptDialog, setOpenPromptDialog] = useState(false)

<GraphCanvas 
    promptDialogOpen={openPromptDialog}
    onPromptDialogOpen={() => setOpenPromptDialog(true)}
    onPromptDialogClose={() => setOpenPromptDialog(false)}
/>
```

### 方式2：组件级控制
```typescript
// 直接使用GraphCanvas，无需额外配置
<GraphCanvas />
```

## 优势

1. **统一管理**: 所有PromptDialog操作都通过同一个实例
2. **数据共享**: 避免重复状态和数据不一致
3. **灵活配置**: 支持多种使用方式
4. **向后兼容**: 不破坏现有功能
5. **易于维护**: 集中管理，减少代码重复
