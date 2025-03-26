'use client'

import React, { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,

} from 'reactflow'
import 'reactflow/dist/style.css'
import { useGraphStore } from '@/lib/graphStore'
import ThoughtCard from './ThoughtCard'
import { createThoughtNode } from '@/lib/nodeUtils'
import { ExpandOptionsPopover } from './ExpandOptionsPopover'
import { Button, Box } from '@mui/material'

const nodeTypes = { thoughtCard: ThoughtCard }

export default function GraphCanvas() {
    const { nodes: storeNodes, edges: storeEdges, addNode, addEdge: addStoreEdge } = useGraphStore()
    const [nodes, setLocalNodes, onNodesChange] = useNodesState(storeNodes)
    const [edges, setLocalEdges, onEdgesChange] = useEdgesState(storeEdges)
    const [selectedNode, setSelectedNode] = useState<any | null>(null)

    useEffect(() => setLocalNodes(storeNodes), [storeNodes])
    useEffect(() => setLocalEdges(storeEdges), [storeEdges])

    const handleExpand = useCallback(
        (mode: 'depth' | 'free' | 'tag', node: any) => {
            const branchData = [
                {
                    title: mode === 'depth' ? '深入A' : mode === 'free' ? '发散A' : '标签A',
                    summary: `由 ${node.data.title} ${mode} 展开`,
                    tags: ['分支'],
                },
                {
                    title: mode === 'depth' ? '深入B' : mode === 'free' ? '发散B' : '标签B',
                    summary: `由 ${node.data.title} ${mode} 展开`,
                    tags: ['分支'],
                },
            ]

            const createdNodes = branchData.map((data, idx) => {
                const angle = (idx / branchData.length) * 2 * Math.PI
                const distance = 180
                return createThoughtNode(
                    node.position.x + Math.cos(angle) * distance,
                    node.position.y + Math.sin(angle) * distance,
                    { ...data, color: '#60a5fa' }
                )
            })

            const createdEdges = createdNodes.map((childNode) => ({
                id: `${node.id}-${childNode.id}`,
                source: node.id,
                target: childNode.id,
            }))

            addNode(...createdNodes)
            addStoreEdge(...createdEdges)
            setSelectedNode(null)
        },
        [addNode, addStoreEdge]
    )

    const handleNodeClick = useCallback((_event: any, node: any) => {
        setSelectedNode(node)
    }, [])

    const handlePaneClick = () => {
        if (nodes.length === 0) {
            const rootNode = createThoughtNode(400, 300, {
                title: '一个想法',
                summary: '一切从这里开始',
                tags: ['root'],
                color: '#4ade80',
            })
            addNode(rootNode)
        } else {
            setSelectedNode(null)
        }
    }

    return (
        <Box position="relative" height="100%" width="100%">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
                fitView
                nodeTypes={nodeTypes}
            >
                <MiniMap />
                <Controls />
                <Background gap={16} size={1} />
            </ReactFlow>

            {selectedNode && (
                <Box position="absolute" top={20} right={20}>
                    <ExpandOptionsPopover
                        trigger={
                            <Button variant="contained" color="success">
                                选择展开模式
                            </Button>
                        }
                        onExpand={(mode) => handleExpand(mode, selectedNode)}
                    />
                </Box>
            )}
        </Box>
    )
}
