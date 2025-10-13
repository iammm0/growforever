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
import {Typography} from "@mui/material";
import {useTheme} from "@mui/system";
import {useGraphStore} from "../../lib/graphStore";
import {nodeTypes} from "../../types/ThoughtNode";
import ExpandOptionsPopover from "./ExpandOptionsPopover";

const VERTICAL_SPACING = 220
const HORIZONTAL_SPACING = 260
const AUTO_PROMPT_FALLBACK = '系统自动扩展'
const MOCK_SUMMARIES = [
    '系统自动扩展的内容',
    '与当前主题高度关联的概念',
    '可能的新领域方向探索',
    '基于上下文的深度联想',
    '推演出的潜在逻辑分支',
    '抽象出的关联元素',
    '来自AI的启发式推理',
]

type ExpandActionType = 'related' | 'deep' | 'new'

type ExpandActionPayload = {
    type: ExpandActionType
    prompt?: string
    title?: string
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
    const MAX_NODE_COUNT = 100
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const getRandomExpandType = useCallback((): ExpandActionType => {
        const types: ExpandActionType[] = ['related', 'deep', 'new']
        return types[Math.floor(Math.random() * types.length)]
    }, [])

    const handleExpandOption = useCallback(
        (option: ExpandActionType | ExpandActionPayload) => {
            if (nodes.length >= MAX_NODE_COUNT) {
                console.warn('🌪️ 节点数量达到上限，停止自动扩展')
                return
            }

            if (!selectedNode) return

            const payload: ExpandActionPayload =
                typeof option === 'string' ? { type: option } : option

            const normalizedPrompt = (payload.prompt ?? '').trim() ||
                (typeof selectedNode.data?.prompt === 'string' && selectedNode.data.prompt
                    ? selectedNode.data.prompt
                    : AUTO_PROMPT_FALLBACK)

            const updatedTitle = payload.title?.trim()

            const newId = `${selectedNode.id}-${Date.now()}`

            const newNode: Node = {
                id: newId,
                type: 'thought',
                position: {
                    x: selectedNode.position.x,
                    y: selectedNode.position.y + VERTICAL_SPACING,
                },
                data: {
                    title:
                        payload.type === 'new'
                            ? '新想法'
                            : payload.type === 'deep'
                            ? '深入扩展'
                            : '关联概念',
                    description: MOCK_SUMMARIES[Math.floor(Math.random() * MOCK_SUMMARIES.length)],
                    node_metadata: { tags: [payload.type] },
                    highlight: false,
                    depth: (selectedNode.data?.depth ?? 0) + 1,
                    prompt: '',
                    order: Date.now(),
                    magnified: false,
                },
                draggable: false,
            }

            const newEdge: Edge = {
                id: `${selectedNode.id}-${newId}`,
                source: selectedNode.id,
                target: newId,
                type: 'default',
            }

            const updatedEdges = [...edges, newEdge]

            const parentUpdatedNodes = nodes.map((node) => {
                if (node.id === selectedNode.id) {
                    return {
                        ...node,
                        draggable: false,
                        data: {
                            ...node.data,
                            title: updatedTitle || node.data?.title,
                            prompt: normalizedPrompt,
                            highlight: true,
                            magnified: false,
                        },
                    }
                }
                return {
                    ...node,
                    draggable: false,
                    data: {
                        ...node.data,
                        highlight: node.id === 'root' || node.id === selectedNode.id,
                        magnified: false,
                    },
                }
            })

            const nodesWithNew = [...parentUpdatedNodes, newNode]
            const repositionedNodes = repositionNodes(nodesWithNew, updatedEdges)

            setNodes(repositionedNodes)
            setStoreNodes(() => repositionedNodes)
            setEdges(updatedEdges)
            addEdgeToStore(newEdge)

            setSelectedNode(null)
            setPopoverPosition(null)

            if (selectedNode.data?.role === 'seed' && !hasExpandedSeed) {
                setHasExpandedSeed(true)
            }
        },
        [addEdgeToStore, edges, hasExpandedSeed, nodes, selectedNode, setEdges, setNodes, setStoreNodes],
    )

    useEffect(() => {
        if (!selectedNode) return
        if (growMode === 'manual') return

        const interval = setInterval(() => {
            handleExpandOption({
                type: getRandomExpandType(),
                prompt:
                    typeof selectedNode.data?.prompt === 'string' && selectedNode.data.prompt
                        ? selectedNode.data.prompt
                        : AUTO_PROMPT_FALLBACK,
            })
        }, growMode === 'fury' ? 200 : 1500)

        return () => clearInterval(interval)
    }, [getRandomExpandType, growMode, handleExpandOption, selectedNode])

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
            const newEdge: Edge = {
                ...connection,
                id: `${connection.source}-${connection.target}-${Date.now()}`,
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

            if (growMode !== 'manual' && !hasExpandedSeed) {
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
                    highlight: node.id === parentId || node.id === 'root',
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
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: isDark ? '#1f1f1f' : '#000',
                    color: isDark ? '#e0e0e0' : '#fff',
                    padding: '4px 12px',
                    borderRadius: 4,
                    fontSize: '12px',
                    zIndex: 1000,
                }}
            >
                当前模式：{growMode === 'manual' ? '手动模式' : growMode === 'free' ? '自由模式' : '狂暴模式'}
            </Typography>

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
                    onExpand={handleExpandOption}
                    onMagnify={handleMagnify}
                    hasExpandedSeed={hasExpandedSeed}
                    isLeaf={selectedNodeIsLeaf}
                    onClose={() => {
                        setSelectedNode(null)
                        setPopoverPosition(null)
                    }}
                />
            )}
        </div>
    )
}
