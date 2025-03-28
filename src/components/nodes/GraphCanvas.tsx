'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react'
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
import {useGraphStore} from "@/lib/graphStore";
import {nodeTypes} from "@/types/ThoughtNode";
import ExpandOptionsPopover from "@/components/nodes/ExpandOptionsPopover";
import {Typography} from "@mui/material";

export default function GraphCanvas() {
    const {
        nodes: storeNodes,
        edges: storeEdges,
        setNodes: setStoreNodes,
        setEdges: setStoreEdges,
        addEdge: addEdgeToStore,
    } = useGraphStore()

    const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)
    const growMode = useGraphStore((state) => state.growMode)

    const [initialized, setInitialized] = useState(false)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
    const popoverRef = useRef<HTMLDivElement | null>(null)
    const MAX_NODE_COUNT = 100
    const mockSummaries = [
        '系统自动扩展的内容',
        '与当前主题高度关联的概念',
        '可能的新领域方向探索',
        '基于上下文的深度联想',
        '推演出的潜在逻辑分支',
        '抽象出的关联元素',
        '来自AI的启发式推理',
    ]



    function getRandomExpandType(): 'related' | 'deep' | 'new' {
        const types = ['related', 'deep', 'new']
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return types[Math.floor(Math.random() * types.length)]
    }

    useEffect(() => {
        console.log('🧠 当前节点总数：', nodes.length)
    }, [nodes])

    useEffect(() => {
        if (!selectedNode) return

        if (growMode === 'manual') return // manual 模式不自动增长

        const interval = setInterval(() => {
            handleExpandOption(getRandomExpandType())
        }, growMode === 'fury' ? 200 : 1500)

        return () => clearInterval(interval)
    }, [growMode, selectedNode])

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

    // 初始化根节点
    useEffect(() => {
        if (!initialized && storeNodes.length === 0) {
            setStoreNodes(() => [
                {
                    id: 'root',
                    type: 'thought',
                    position: { x: 300, y: 150 },
                    data: {
                        title: '🌱 永恒之森 - 种子',
                        summary: '一切从一个想法开始。',
                        tags: ['AI', '思维链'],
                        highlight: true,
                        role: 'seed'
                    },
                },
            ])
            setInitialized(true)
        }
    }, [initialized, storeNodes.length, setStoreNodes])

    // 同步 zustand 状态
    useEffect(() => setNodes(storeNodes), [storeNodes])
    useEffect(() => setEdges(storeEdges), [storeEdges])

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
        [setEdges, addEdgeToStore]
    )


    // 点击节点
    const onNodeClick = useCallback(
        (event: React.MouseEvent, clickedNode: Node) => {
            setSelectedNode(clickedNode)

            if (growMode !== 'manual') return // 非手动模式不弹出 Popover

            const rect = (event.target as HTMLElement).getBoundingClientRect()
            setPopoverPosition({
                x: rect.left + rect.width / 2,
                y: rect.top,
            })

            // 高亮父节点
            const parentEdge = edges.find((e) => e.target === clickedNode.id)
            const parentId = parentEdge?.source
            setNodes((nds) =>
                nds.map((node) => ({
                    ...node,
                    data: {
                        ...node.data,
                        highlight: node.id === parentId || node.id === 'root',
                    },
                }))
            )
        },
        [edges, setNodes, growMode]
    )


    const handleExpandOption = (type: 'related' | 'deep' | 'new') => {
        if (nodes.length >= MAX_NODE_COUNT) {
            console.warn('🌪️ 节点数量达到上限，停止自动扩展')
            return
        }

        if (!selectedNode) return
        const newId = `${selectedNode.id}-${Date.now()}`
        const newNode: Node = {
            id: newId,
            type: 'thought',
            position: {
                x: selectedNode.position.x + 180 + Math.random() * 40,
                y: selectedNode.position.y + (Math.random() - 0.5) * 100,
            },
            data: {
                title: type === 'new' ? '新想法' : type === 'deep' ? '深入扩展' : '关联概念',
                summary: mockSummaries[Math.floor(Math.random() * mockSummaries.length)],
                tags: [type],
                highlight: false,
            },
        }

        const newEdge: Edge = {
            id: `${selectedNode.id}-${newId}`,
            source: selectedNode.id,
            target: newId,
            type: 'default',
        }

        setNodes((nds) => [...nds, newNode])
        setEdges((eds) => [...eds, newEdge])
        setSelectedNode(null)
        setPopoverPosition(null)
    }


    return (
        <div style={{ height: '100vh', width: '100vw' ,position: 'relative'}}>
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: '#000',
                    color: '#fff',
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
            >
                <MiniMap />
                <Controls />
            </ReactFlow>

            {growMode === 'manual' && selectedNode && popoverPosition && (
                <ExpandOptionsPopover
                    ref={popoverRef}
                    node={selectedNode}
                    position={popoverPosition}
                    onExpand={handleExpandOption}
                    onClose={() => {
                        setSelectedNode(null)
                        setPopoverPosition(null)
                    }}
                />
            )}
        </div>
    )
}
