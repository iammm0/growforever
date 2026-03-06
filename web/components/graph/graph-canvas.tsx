'use client'

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import ReactFlow, {
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    MarkerType,
} from 'reactflow'
import type { Node } from 'reactflow'
import 'reactflow/dist/style.css'
import { useTheme } from '@/context/theme-context'
import {useGraphStore} from "@/core/store/graph-store";
import {nodeTypes} from "@/components/graph/thought-card";
import ExpandOptionsPopover from "@/components/graph/expand-options-popover";
import PromptDialog from "@/components/graph/prompt-dialog";
import GrowingThoughtNode from './growing-thought-node'
import GrowingConnectionLine from './growing-connection-line'

const VERTICAL_SPACING = 220
const HORIZONTAL_SPACING = 260

// 自定义节点和边类型
const customNodeTypes = {
  ...nodeTypes,
  'growing-thought': GrowingThoughtNode,
  'thought': nodeTypes.thought, // 确保thought类型使用ThoughtCard组件
}

const customEdgeTypes = {
  'growing-connection': GrowingConnectionLine,
}

type NodeWithDepth = Node & { data: Node['data'] & { depth?: number; order?: number | string } }

const resolveOrder = (node: NodeWithDepth) => {
    const rawOrder = node.data?.order
    if (typeof rawOrder === 'number') return rawOrder
    if (typeof rawOrder === 'string') {
        const parsed = Number(rawOrder)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

const repositionNodes = (inputNodes: Node[], inputEdges: Edge[]): Node[] => {
    if (!inputNodes.length) return inputNodes

    const nodesById = new Map(inputNodes.map((node) => [node.id, node]))
    const childrenByParent = new Map<string, string[]>()
    const parentByChild = new Map<string, string>()

    inputEdges.forEach((edge) => {
        parentByChild.set(edge.target, edge.source)
        const existing = childrenByParent.get(edge.source) ?? []
        childrenByParent.set(edge.source, [...existing, edge.target])
    })

    const arranged = new Map<string, Node>()
    const visited = new Set<string>()

    const placeNode = (nodeId: string, depth: number) => {
        if (visited.has(nodeId)) return
        visited.add(nodeId)

        const node = nodesById.get(nodeId) as NodeWithDepth | undefined
        if (!node) return

        const parentId = parentByChild.get(nodeId)
        let position = node.position

        if (parentId) {
            const parentNode = (arranged.get(parentId) as NodeWithDepth | undefined) ?? (nodesById.get(parentId) as NodeWithDepth | undefined)
            if (parentNode) {
                const siblings = childrenByParent.get(parentId) ?? []
                const index = siblings.indexOf(nodeId)
                const offset = (index - (siblings.length - 1) / 2) * HORIZONTAL_SPACING
                position = {
                    x: parentNode.position.x + offset,
                    y: parentNode.position.y + VERTICAL_SPACING,
                }
            }
        } else {
            position = {
                x: node.position.x,
                y: node.position.y,
            }
        }

        const depthValue = depth < 0 ? 0 : depth
        const orderValue = resolveOrder(node)
        const zIndex = orderValue || depthValue + 1

        const updatedNode: Node = {
            ...node,
            position,
            draggable: false,
            selectable: true,
            data: {
                ...node.data,
                depth: depthValue,
            },
            style: {
                ...node.style,
                zIndex,
            },
        }

        arranged.set(nodeId, updatedNode)

        const children = childrenByParent.get(nodeId) ?? []
        children.forEach((childId) => placeNode(childId, depthValue + 1))
    }

    const rootCandidates = inputNodes.filter((node) => !parentByChild.has(node.id))
    if (rootCandidates.length === 0 && inputNodes.length > 0) {
        placeNode(inputNodes[0].id, 0)
    } else {
        rootCandidates.forEach((root) => placeNode(root.id, 0))
    }

    inputNodes.forEach((node) => {
        if (!arranged.has(node.id)) {
            const depthValue = typeof node.data?.depth === 'number' ? node.data.depth : 0
            const orderValue = resolveOrder(node as NodeWithDepth)
            arranged.set(node.id, {
                ...node,
                draggable: false,
                selectable: true,
                data: {
                    ...node.data,
                    depth: depthValue,
                },
                style: {
                    ...node.style,
                    zIndex: orderValue || depthValue + 1,
                },
            })
        }
    })

    return Array.from(arranged.values())
}

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
    const {
        nodes: storeNodes,
        edges: storeEdges,
        setNodes: setStoreNodes,
        addEdge: addEdgeToStore,
    } = useGraphStore()

    const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)
    const growMode = useGraphStore((state) => state.growMode)

    const [initialized, setInitialized] = useState(false)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
    const popoverRef = useRef<HTMLDivElement | null>(null)
    const [hasExpandedSeed, setHasExpandedSeed] = useState(false)
    const [isProcessingText, setIsProcessingText] = useState(false)
    const [isProcessingGNN, setIsProcessingGNN] = useState(false)
    const [internalPromptDialogOpen, setInternalPromptDialogOpen] = useState(false)
    const [isProgressiveRendering, setIsProgressiveRendering] = useState(false)
    const [pendingNodes, setPendingNodes] = useState<any[]>([])
    const [pendingEdges, setPendingEdges] = useState<any[]>([])
    const [renderedNodes, setRenderedNodes] = useState<string[]>([])
    const [renderedEdges, setRenderedEdges] = useState<string[]>([])
    
    // 使用外部传入的状态，如果没有则使用内部状态
    const promptDialogOpen = externalPromptDialogOpen !== undefined ? externalPromptDialogOpen : internalPromptDialogOpen
    const { actualMode } = useTheme()
    const isDark = actualMode === 'dark'


    // 文本扩展功能
    const handleTextExpand = useCallback(async (prompt: string) => {
        if (!selectedNode) return

        setIsProcessingText(true)
        try {
            const response = await fetch('/api/expand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'continue',
                    input: prompt,
                    temperature: 0.7,
                    maxTokens: 1000
                })
            })

            if (!response.ok) {
                throw new Error('文本扩展失败')
            }

            const data = await response.json()
            const expandedText = data.text

            // 更新节点数据，添加扩展文本
            const updatedNodes = nodes.map(node => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            expandedText,
                            prompt,
                            title: selectedNode.data?.title || '种子'
                        }
                    }
                }
                return node
            })

            setNodes(updatedNodes)
            setStoreNodes(() => updatedNodes)
        } catch (error) {
            console.error('文本扩展错误:', error)
            throw error
        } finally {
            setIsProcessingText(false)
        }
    }, [selectedNode, nodes, setNodes, setStoreNodes])

    // 渐进式渲染算法
    const startProgressiveRendering = useCallback(async (gnnNodes: any[], gnnEdges: any[]) => {
        setIsProgressiveRendering(true)
        setPendingNodes(gnnNodes)
        setPendingEdges(gnnEdges)
        setRenderedNodes([])
        setRenderedEdges([])

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
            
            return {
                id: nodeId,
                originalId: gnnNode.id,
                type: 'thought', // 使用标准的thought类型，应用ThoughtCard UI
                position: gnnNode.position || {
                    x: 300 + (index % 3) * 300,
                    y: 200 + Math.floor(index / 3) * 200
                },
                data: {
                    title: gnnNode.title,
                    description: gnnNode.description || `这是通过GNN服务生成的节点：${gnnNode.title}`,
                    node_metadata: gnnNode.nodeMetadata || { tags: [gnnNode.type] },
                    highlight: gnnNode.nodeMetadata?.highlight || false,
                    depth: 1,
                    prompt: '',
                    order: Date.now() + index,
                    magnified: gnnNode.nodeMetadata?.magnified || false,
                    role: 'generated',
                    expandedText: gnnNode.description || `节点 "${gnnNode.title}" 的详细信息将在这里显示。`,
                    isGrowing: true // 标记为生长中
                },
                draggable: false,
            }
        })

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
            
            return {
                id: edgeId,
                originalId: gnnEdge.id,
                source: nodeIdMap.get(gnnEdge.sourceId) || gnnEdge.sourceId,
                target: nodeIdMap.get(gnnEdge.targetId) || gnnEdge.targetId,
                type: 'default', // 使用默认边类型
                label: gnnEdge.label,
                data: {
                    type: gnnEdge.type,
                    properties: gnnEdge.properties,
                    isGrowing: true // 标记为生长中
                }
            }
        })

        // 开始渐进式渲染
        await renderNodesProgressively(processedNodes, processedEdges)
    }, [nodes, edges, setNodes, setEdges, setStoreNodes, addEdgeToStore])

    // 渐进式渲染节点
    const renderNodesProgressively = useCallback(async (processedNodes: any[], processedEdges: any[]) => {
        const RENDER_DELAY = 300 // 每个节点渲染间隔
        const EDGE_DELAY = 200 // 边渲染延迟
        const renderedEdgeIds = new Set<string>()

        for (let i = 0; i < processedNodes.length; i++) {
            const node = processedNodes[i]
            
            // 添加节点到画布
            setNodes(prevNodes => [...prevNodes, node])
            setStoreNodes(prevNodes => [...prevNodes, node])
            setRenderedNodes(prev => [...prev, node.id])

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
                    setRenderedEdges(prev => [...prev, edge.id])
                    renderedEdgeIds.add(edge.id)
                    
                    // 边的渲染延迟
                    await new Promise(resolve => setTimeout(resolve, EDGE_DELAY))
                }
            }
        }

        // 完成渲染，移除生长标记，并确保生成的节点支持放大查看
        setNodes(prevNodes => prevNodes.map(node => {
            // 如果是新生成的节点，确保它们支持放大查看并使用ThoughtCard UI
            if (node.data?.role === 'generated') {
                return {
                    ...node,
                    type: 'thought', // 确保使用ThoughtCard组件
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
            return {
                ...node,
                data: {
                    ...node.data,
                    isGrowing: false
                }
            }
        }))

        setEdges(prevEdges => prevEdges.map(edge => ({
            ...edge,
            data: {
                ...edge.data,
                isGrowing: false
            }
        })))

        setIsProgressiveRendering(false)
        setPendingNodes([])
        setPendingEdges([])
    }, [setNodes, setEdges, setStoreNodes, addEdgeToStore])

    // GNN处理功能
    const handleGNNProcess = useCallback(async (
        text: string, 
        modelName?: string | null, 
        strategy?: string
    ) => {
        if (!selectedNode) return

        setIsProcessingGNN(true)
        try {
            const requestBody: {
                text: string
                seedId?: number
                model_name?: string | null
                strategy?: string
            } = {
                text,
                seedId: 1 // 可以从store中获取实际的seedId
            }
            
            if (modelName !== undefined) {
                requestBody.model_name = modelName
            }
            
            if (strategy !== undefined) {
                requestBody.strategy = strategy
            }
            
            const response = await fetch('/api/gnn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            if (!response.ok) {
                throw new Error('GNN处理失败')
            }

            const gnnData = await response.json()
            const { nodes: gnnNodes, edges: gnnEdges } = gnnData

            // 开始渐进式渲染
            await startProgressiveRendering(gnnNodes, gnnEdges)

            // 关闭弹窗
            setSelectedNode(null)
            setPopoverPosition(null)
            setHasExpandedSeed(true)

        } catch (error) {
            console.error('GNN处理错误:', error)
            throw error
        } finally {
            setIsProcessingGNN(false)
        }
    }, [selectedNode, startProgressiveRendering])



    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current &&
                event.target instanceof window.Node &&
                !popoverRef.current.contains(event.target)
            ) {
                setSelectedNode(null)
                setPopoverPosition(null)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (!initialized && storeNodes.length === 0) {
            setStoreNodes(() => [
                {
                    id: 'root',
                    type: 'thought',
                    position: { x: 300, y: 150 },
                    draggable: false,
                    data: {
                        title: '种子',
                        description: '一切从一个想法开始。',
                        node_metadata: { tags: ['开心', '兴奋'] },
                        highlight: true,
                        role: 'seed',
                        depth: 0,
                        prompt: '',
                        order: 0,
                        magnified: false,
                    },
                },
            ])
            setInitialized(true)
        }
    }, [initialized, setStoreNodes, storeNodes.length])

    useEffect(() => {
        const locked = storeNodes.map((node) => ({
            ...node,
            draggable: false,
        }))
        setNodes(repositionNodes(locked, storeEdges))
    }, [setNodes, storeEdges, storeNodes])

    useEffect(() => setEdges(storeEdges), [setEdges, storeEdges])

    useEffect(() => {
        if (hasExpandedSeed) return
        const seedIds = nodes.filter((node) => node.data?.role === 'seed').map((node) => node.id)
        if (!seedIds.length) return
        const seedHasChildren = edges.some((edge) => seedIds.includes(edge.source))
        if (seedHasChildren) {
            setHasExpandedSeed(true)
        }
    }, [edges, nodes, hasExpandedSeed])

    const onConnect = useCallback(
        (connection: Connection) => {
            if (!connection.source || !connection.target) return
            // 生成更唯一的边ID
            const uniqueId = `${connection.source}-${connection.target}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            const newEdge: Edge = {
                ...connection,
                id: uniqueId,
                source: connection.source,
                target: connection.target,
                sourceHandle: connection.sourceHandle ?? undefined,
                targetHandle: connection.targetHandle ?? undefined,
                type: 'default',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                },
            }
            setEdges((eds) => addEdge(newEdge, eds))
            addEdgeToStore(newEdge)
        },
        [addEdgeToStore, setEdges],
    )

    const onNodeClick = useCallback(
        (event: React.MouseEvent, clickedNode: Node) => {
            const latestNode = nodes.find((node) => node.id === clickedNode.id) ?? clickedNode
            setSelectedNode(latestNode)

            // 对于种子节点，显示prompt-dialog
            const isSeed = latestNode.data?.role === 'seed'
            
            if (isSeed) {
                if (onPromptDialogOpen) {
                    onPromptDialogOpen()
                } else {
                    setInternalPromptDialogOpen(true)
                }
                return
            }

            // 对于生成的节点，不显示扩展选项，让节点组件自己处理点击事件
            // 生成的节点会通过ThoughtCard组件的点击事件来显示预览弹窗
            if (latestNode.data?.role === 'generated') {
                // 不显示扩展选项弹窗，让节点组件处理点击
                return
            }
            
            if (!isSeed && growMode !== 'manual' && !hasExpandedSeed) {
                return
            }

            const rect = (event.target as HTMLElement).getBoundingClientRect()
            setPopoverPosition({
                x: rect.left + rect.width / 2,
                y: rect.top,
            })

            const parentEdge = edges.find((edge) => edge.target === latestNode.id)
            const parentId = parentEdge?.source
            const highlighted = nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    highlight: node.id === parentId || node.id === 'root' || (isSeed && node.id === latestNode.id),
                },
            }))
            setNodes(highlighted)
            setStoreNodes(() => highlighted)
        },
        [edges, growMode, hasExpandedSeed, nodes, setNodes, setStoreNodes, onPromptDialogOpen, setInternalPromptDialogOpen],
    )

    const handleMagnify = useCallback(
        (nodeId: string) => {
            const toggled = nodes.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    magnified: node.id === nodeId ? !node.data?.magnified : false,
                },
            }))
            setNodes(toggled)
            setStoreNodes(() => toggled)

            if (selectedNode?.id === nodeId) {
                const latest = toggled.find((node) => node.id === nodeId) ?? null
                setSelectedNode(latest)
            }
        },
        [nodes, selectedNode, setNodes, setStoreNodes],
    )

    const selectedNodeIsLeaf = useMemo(
        () => (selectedNode ? !edges.some((edge) => edge.source === selectedNode.id) : false),
        [edges, selectedNode],
    )

    return (
        <div
            style={{ height: '100vh', width: '100vw', position: 'relative' }}
            className={isDark ? 'dark-flow' : ''}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                nodeTypes={customNodeTypes}
                edgeTypes={customEdgeTypes}
                fitView
                panOnDrag
                zoomOnScroll
                nodesDraggable={false}
            >
                <MiniMap />
                <Controls />
            </ReactFlow>

            {selectedNode && popoverPosition && (
                <ExpandOptionsPopover
                    ref={popoverRef}
                    node={selectedNode}
                    position={popoverPosition}
                    onExpand={() => {}} // 空函数，保持接口兼容
                    onMagnify={handleMagnify}
                    hasExpandedSeed={hasExpandedSeed}
                    isLeaf={selectedNodeIsLeaf}
                    onTextExpand={handleTextExpand}
                    onGNNProcess={handleGNNProcess}
                    onClose={() => {
                        setSelectedNode(null)
                        setPopoverPosition(null)
                    }}
                />
            )}

            <PromptDialog
                open={promptDialogOpen}
                onClose={() => {
                    if (onPromptDialogClose) {
                        onPromptDialogClose()
                    } else {
                        setInternalPromptDialogOpen(false)
                    }
                    setSelectedNode(null)
                }}
                onTextExpand={handleTextExpand}
                onGNNProcess={handleGNNProcess}
            />
        </div>
    )
}
