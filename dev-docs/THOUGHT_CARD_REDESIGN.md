# ThoughtCard组件重新设计说明

## 设计概述

重新设计了ThoughtCard组件，实现了简洁的节点显示和点击放大查看的预览弹窗功能，符合项目整体主题风格。

## 主要特性

### 1. **简洁的节点显示**
- **隐藏详细信息**: 不再显式展示description和label
- **紧凑布局**: 只显示标题、标签和角色指示器
- **视觉层次**: 清晰的信息层次结构

### 2. **点击放大查看**
- **预览弹窗**: 点击节点弹出专门的预览弹窗
- **详细信息**: 在弹窗中展示完整的description和expandedText
- **交互体验**: 流畅的动画和过渡效果

### 3. **符合项目主题的UI设计**
- **绿色系配色**: 使用项目统一的绿色主题
- **毛玻璃效果**: 现代化的视觉设计
- **渐变背景**: 增强视觉层次感

## 组件结构

### 1. **节点组件 (ThoughtCard)**
```typescript
interface ThoughtCardData {
    title: string
    description?: string
    node_metadata?: {
        tags?: string[]
        highlight?: boolean
    }
    highlight?: boolean
    magnified?: boolean
    expandedText?: string
    role?: string
}
```

#### 节点布局
- **标题区域**: 显示节点标题和放大按钮
- **标签区域**: 显示前2个标签，超过则显示"+N"
- **角色指示器**: 显示节点类型（种子/生成/节点）

### 2. **预览弹窗 (NodePreviewModal)**
#### 弹窗内容
- **描述部分**: 显示节点的description
- **扩展内容**: 显示expandedText
- **标签列表**: 显示所有标签
- **元数据**: 显示节点类型和状态信息

## UI设计细节

### 1. **节点样式**
```css
.thoughtCard {
    width: 200px;
    min-height: 120px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.9);
    border: 2px solid rgba(34, 197, 94, 0.2);
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
```

#### 视觉特点
- **圆角设计**: 16px圆角，现代化外观
- **毛玻璃效果**: backdrop-filter增强层次感
- **绿色边框**: 符合项目主题
- **柔和阴影**: 增加立体感

### 2. **标签设计**
```css
.tag {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border-radius: 8px;
    font-size: 10px;
    padding: 2px 6px;
}
```

#### 标签特点
- **渐变背景**: 绿色渐变增强视觉效果
- **圆角设计**: 8px圆角，与整体风格一致
- **紧凑布局**: 小尺寸字体和间距

### 3. **预览弹窗设计**
```css
.modalContent {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    border: 1px solid rgba(34, 197, 94, 0.2);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    max-width: 600px;
}
```

#### 弹窗特点
- **大圆角**: 20px圆角，现代化设计
- **强毛玻璃**: 增强背景模糊效果
- **分层设计**: 清晰的内容层次
- **响应式**: 适配不同屏幕尺寸

## 交互设计

### 1. **节点交互**
- **悬停效果**: 轻微缩放和阴影变化
- **点击反馈**: 弹出预览弹窗
- **动画过渡**: 流畅的spring动画

### 2. **弹窗交互**
- **背景点击**: 点击背景关闭弹窗
- **ESC键**: 支持键盘关闭
- **动画效果**: 缩放和淡入淡出

### 3. **按钮交互**
- **放大按钮**: 悬停时缩放和颜色变化
- **关闭按钮**: 红色主题，悬停效果
- **操作按钮**: 绿色渐变，悬停上移

## 暗色模式支持

### 1. **节点暗色样式**
```css
:global(.dark) .thoughtCard {
    background: rgba(18, 18, 18, 0.9);
    color: #e5e5e5;
    border-color: rgba(74, 222, 128, 0.3);
}
```

### 2. **弹窗暗色样式**
```css
:global(.dark) .modalContent {
    background: rgba(18, 18, 18, 0.95);
    border-color: rgba(74, 222, 128, 0.3);
    color: #e5e5e5;
}
```

### 3. **颜色适配**
- **主色调**: 使用更亮的绿色 (#4ade80)
- **背景色**: 深色背景 (#121212)
- **文字色**: 浅色文字 (#e5e5e5)

## 边样式优化

### 1. **渐变边设计**
```css
/* 正常状态渐变 */
linearGradient id="gradient-normal"
  stop offset="0%" stopColor="#22c55e" stopOpacity="0.8"
  stop offset="50%" stopColor="#4ade80" stopOpacity="1"
  stop offset="100%" stopColor="#16a34a" stopOpacity="0.8"

/* 生长状态渐变 */
linearGradient id="gradient-growing"
  stop offset="0%" stopColor="#22c55e" stopOpacity="1"
  stop offset="25%" stopColor="#4ade80" stopOpacity="1"
  stop offset="50%" stopColor="#22c55e" stopOpacity="1"
  stop offset="75%" stopColor="#4ade80" stopOpacity="1"
  stop offset="100%" stopColor="#16a34a" stopOpacity="1"
```

### 2. **边标签设计**
```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
border: 1px solid rgba(34, 197, 94, 0.3);
box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
backdrop-filter: blur(8px);
```

## 技术实现

### 1. **状态管理**
```typescript
const [showPreview, setShowPreview] = useState(false)

const handleCardClick = () => {
    setShowPreview(true)
}

const handleClosePreview = () => {
    setShowPreview(false)
}
```

### 2. **动画效果**
```typescript
// 节点动画
<motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: magnified ? 1.08 : 1, opacity: 1 }}
    whileHover={{ scale: magnified ? 1.1 : 1.05 }}
    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
>

// 弹窗动画
<motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

### 3. **主题适配**
```typescript
const theme = useTheme()
const isDark = theme.palette.mode === 'dark'
```

## 用户体验提升

### 1. **信息层次**
- **主要信息**: 标题和关键标签
- **详细信息**: 在弹窗中展示
- **状态指示**: 角色和状态标识

### 2. **视觉反馈**
- **悬停效果**: 提供交互反馈
- **动画过渡**: 流畅的视觉体验
- **状态变化**: 清晰的状态指示

### 3. **操作便捷**
- **一键查看**: 点击即可查看详情
- **快速关闭**: 多种关闭方式
- **键盘支持**: 支持ESC键关闭

## 响应式设计

### 1. **弹窗适配**
- **最大宽度**: 600px
- **最大高度**: 80vh
- **内边距**: 20px
- **滚动支持**: 内容过多时滚动

### 2. **移动端优化**
- **触摸友好**: 合适的点击区域
- **字体大小**: 适配小屏幕
- **间距调整**: 紧凑的布局

## 总结

重新设计的ThoughtCard组件实现了：

1. **简洁美观**: 隐藏冗余信息，突出核心内容
2. **交互友好**: 点击放大查看，流畅的动画效果
3. **主题一致**: 符合项目整体设计风格
4. **功能完整**: 支持明暗主题，响应式设计
5. **用户体验**: 清晰的信息层次，便捷的操作方式

这个设计让知识图谱的节点更加简洁美观，同时保持了完整的信息展示功能，提供了优秀的用户体验。