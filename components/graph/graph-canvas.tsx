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
import {useTheme} from "@mui/system";
import {useGraphStore} from "@/core/store/graph-store";
import {nodeTypes} from "@/components/graph/thought-card";
import ExpandOptionsPopover from "@/components/graph/expand-options-popover";

const VERTICAL_SPACING = 220
const HORIZONTAL_SPACING = 260

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

export default function GraphCanvas() {
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
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'


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

    // GNN处理功能
    const handleGNNProcess = useCallback(async (text: string) => {
        if (!selectedNode) return

        setIsProcessingGNN(true)
        try {
            const response = await fetch('/api/gnn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    seedId: 1 // 可以从store中获取实际的seedId
                })
            })

            if (!response.ok) {
                throw new Error('GNN处理失败')
            }

            const gnnData = await response.json()
            const { nodes: gnnNodes, edges: gnnEdges } = gnnData

            // 转换GNN返回的数据为ReactFlow格式
            // 先检查现有节点，避免重复ID
            const existingNodeIds = new Set(nodes.map(node => node.id))
            const newNodes: Node[] = gnnNodes
                .filter(gnnNode => !existingNodeIds.has(gnnNode.id)) // 过滤掉已存在的节点
                .map((gnnNode: any, index: number) => {
                    // 确保节点ID唯一，如果重复则添加后缀
                    let nodeId = gnnNode.id
                    let counter = 1
                    while (existingNodeIds.has(nodeId)) {
                        nodeId = `${gnnNode.id}-${counter}`
                        counter++
                    }
                    existingNodeIds.add(nodeId) // 添加到已存在ID集合中
                    
                    return {
                        id: nodeId,
                        type: 'thought',
                        position: gnnNode.position || {
                            x: 300 + (index % 3) * 300,
                            y: 200 + Math.floor(index / 3) * 200
                        },
                        data: {
                            title: gnnNode.title,
                            description: gnnNode.description || '',
                            node_metadata: gnnNode.nodeMetadata || { tags: [gnnNode.type] },
                            highlight: gnnNode.nodeMetadata?.highlight || false,
                            depth: 1,
                            prompt: '',
                            order: Date.now() + index,
                            magnified: gnnNode.nodeMetadata?.magnified || false,
                            role: 'generated'
                        },
                        draggable: false,
                    }
                })

            // 检查现有边，避免重复边
            const existingEdgeIds = new Set(edges.map(edge => edge.id))
            // 创建节点ID映射，用于更新边的source和target
            const nodeIdMap = new Map<string, string>()
            newNodes.forEach(node => {
                // 找到原始ID和实际ID的映射
                const originalId = node.data.title // 假设title是原始ID
                nodeIdMap.set(originalId, node.id)
            })
            
            const newEdges: Edge[] = gnnEdges
                .filter(gnnEdge => !existingEdgeIds.has(gnnEdge.id)) // 过滤掉已存在的边
                .map((gnnEdge: any) => {
                    // 更新边的source和target为实际的节点ID
                    const actualSourceId = nodeIdMap.get(gnnEdge.sourceId) || gnnEdge.sourceId
                    const actualTargetId = nodeIdMap.get(gnnEdge.targetId) || gnnEdge.targetId
                    
                    return {
                        id: gnnEdge.id,
                        source: actualSourceId,
                        target: actualTargetId,
                        type: 'default',
                        label: gnnEdge.label,
                        data: {
                            type: gnnEdge.type,
                            properties: gnnEdge.properties
                        }
                    }
                })

            // 更新节点和边
            const updatedNodes = [...nodes, ...newNodes]
            const updatedEdges = [...edges, ...newEdges]

            setNodes(updatedNodes)
            setEdges(updatedEdges)
            setStoreNodes(() => updatedNodes)
            // 逐条加入 store，避免可变参数误用
            newEdges.forEach((e) => addEdgeToStore(e))

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
    }, [selectedNode, nodes, edges, setNodes, setEdges, setStoreNodes, addEdgeToStore])



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

            // 对于种子节点，总是显示弹窗
            const isSeed = latestNode.data?.role === 'seed'
            
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
        [edges, growMode, hasExpandedSeed, nodes, setNodes, setStoreNodes],
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
                nodeTypes={nodeTypes}
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
        </div>
    )
}
