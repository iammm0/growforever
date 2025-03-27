'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react'
import ReactFlow, {
    Background,
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
import ExpandOptionsPopover from "@/components/ExpandOptionsPopover";

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

    const [initialized, setInitialized] = useState(false)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null)
    const popoverRef = useRef<HTMLDivElement | null>(null)

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

            // 获取画布内坐标
            const rect = (event.target as HTMLElement).getBoundingClientRect()
            const position = {
                x: rect.left + rect.width / 2,
                y: rect.top,
            }

            setPopoverPosition(position)

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
        [edges, setNodes]
    )


    const handleExpandOption = (type: 'related' | 'deep' | 'new') => {
        if (!selectedNode) return
        const newId = `${selectedNode.id}-${Date.now()}`
        const newNode: Node = {
            id: newId,
            type: 'thought',
            position: {
                x: selectedNode.position.x + 200,
                y: selectedNode.position.y + Math.random() * 100,
            },
            data: {
                title: type === 'new' ? '新想法' : type === 'deep' ? '深入扩展' : '关联概念',
                summary: '系统自动扩展的内容',
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

            {selectedNode && popoverPosition && (
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
