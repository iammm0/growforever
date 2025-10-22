# Prompt Dialog 集成说明

## 功能概述

已将种子扩展文本和生成知识图谱的功能从悬空组件转移到 `prompt-dialog` 组件中，提供更好的用户体验。

## 主要变更

### 1. **PromptDialog 组件更新**
- 集成了文本扩展功能
- 集成了GNN处理功能
- 添加了扩展文本的查看和编辑功能
- 提供了完整的错误处理和加载状态

### 2. **GraphCanvas 组件更新**
- 种子节点点击时显示 `PromptDialog` 而不是悬空组件
- 保留了其他节点的悬空组件功能
- 添加了 `showPromptDialog` 状态管理

## 新的用户流程

### 种子节点处理流程
1. **点击种子节点** → 打开 `PromptDialog` 对话框
2. **输入种子标题和提示词** → 点击"扩展文本"按钮
3. **查看和编辑扩展文本** → 点击"查看扩展文本"按钮
4. **生成知识图谱** → 点击"生成知识图谱"按钮
5. **自动关闭对话框** → 在画布上查看生成的知识图谱

### 其他节点处理流程
1. **点击非种子节点** → 显示悬空组件
2. **放大查看** → 使用悬空组件中的放大功能

## 组件特性

### PromptDialog 特性
- **全屏对话框**: 提供更大的工作空间
- **分步操作**: 清晰的步骤引导
- **实时反馈**: 加载状态和错误提示
- **文本编辑**: 支持扩展文本的编辑调整
- **自动关闭**: 完成GNN处理后自动关闭

### 保留的悬空组件特性
- **快速操作**: 非种子节点的快速交互
- **放大查看**: 节点内容的放大显示
- **轻量级**: 不占用过多屏幕空间

## 技术实现

### 状态管理
```typescript
const [showPromptDialog, setShowPromptDialog] = useState(false)
const [isExpanding, setIsExpanding] = useState(false)
const [isProcessingGNN, setIsProcessingGNN] = useState(false)
const [expandedText, setExpandedText] = useState('')
```

### 事件处理
```typescript
// 种子节点点击
if (isSeed) {
    setShowPromptDialog(true)
    return
}

// 文本扩展
const handleTextExpand = async (prompt: string) => { ... }

// GNN处理
const handleGNNProcess = async (text: string) => { ... }
```

## 用户体验改进

1. **更清晰的界面**: 对话框提供更大的工作空间
2. **更好的引导**: 分步骤的操作流程
3. **更完整的反馈**: 详细的加载状态和错误提示
4. **更灵活的编辑**: 支持扩展文本的编辑调整
5. **更流畅的交互**: 自动关闭和状态管理

## 兼容性

- 保持了原有的API接口
- 保留了其他节点的悬空组件功能
- 向后兼容现有的功能逻辑
