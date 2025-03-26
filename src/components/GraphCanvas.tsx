'use client'

import React, {useEffect, useState} from 'react'
import ReactFlow, {
    Background,
    Node as FlowNode,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection, NodeChange, EdgeChange, NodeMouseHandler,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useGraphStore } from '@/lib/graphStore'
import NodePropertyDrawer from "@/components/NodePropertyDrawer";
import {GraphNodeData} from "@/models/GraphNodeData";

export default function GraphCanvas() {
    const { nodes: storeNodes, edges: storeEdges, setNodes, setEdges } = useGraphStore()
    const [selectedNode, setSelectedNode] = useState<FlowNode<GraphNodeData> | null>(null)

    // 本地状态
    const [nodes, setLocalNodes, onLocalNodesChange] = useNodesState<GraphNodeData>(storeNodes)
    const [edges, setLocalEdges, onLocalEdgesChange] = useEdgesState<GraphNodeData>(storeEdges)

    // store 更新时同步到本地
    useEffect(() => {
        setLocalNodes(storeNodes)
    }, [storeNodes, setLocalNodes])

    useEffect(() => {
        setLocalEdges(storeEdges)
    }, [storeEdges, setLocalEdges])

    // 本地变更 => 同步 store
    const onNodesChange = (changes: NodeChange[]) => {
        onLocalNodesChange(changes)
        setNodes(
            changes.reduce((updatedNodes, change) => {
                if (change.type === 'remove') {
                    return updatedNodes.filter((node) => node.id !== change.id)
                }
                if (change.type === 'position' && change.position) {
                    return updatedNodes.map((node) =>
                        node.id === change.id ? { ...node, position: change.position! } : node
                    )
                }
                return updatedNodes
            }, nodes)
        )
    }

    const onEdgesChange = (changes: EdgeChange[]) => {
        onLocalEdgesChange(changes)
        setEdges(
            changes.reduce((updatedEdges, change) => {
                if (change.type === 'remove') {
                    return updatedEdges.filter((edge) => edge.id !== change.id)
                }
                return updatedEdges
            }, edges)
        )
    }

    const onConnect = (connection: Connection) => {
        const newEdges = addEdge(connection, edges)
        setLocalEdges(newEdges)
        setEdges(newEdges)
    }

    const handleNodeClick: NodeMouseHandler = (_, node) => {
        setSelectedNode(node)
    }

    return (
        <div className="h-full w-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={handleNodeClick}
                fitView
            >
                <MiniMap/>
                <Controls/>
                <Background gap={16} size={1}/>
            </ReactFlow>
            {selectedNode && (
                <NodePropertyDrawer selectedNode={selectedNode} onClose={() => setSelectedNode(null)}/>
            )}
        </div>
    )
}
