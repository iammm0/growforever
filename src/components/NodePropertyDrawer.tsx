// 节点属性侧边栏
import { useGraphStore } from '@/lib/graphStore'
import {useEffect, useState} from 'react'
import {GraphNodeData} from "@/models/GraphNodeData";
import {Node as FlowNode} from "reactflow";

interface NodePropertyDrawerProps {
    selectedNode: FlowNode<GraphNodeData> | null
    onClose: () => void
}

export default function NodePropertyDrawer({ selectedNode, onClose }: NodePropertyDrawerProps) {
    const updateNode = useGraphStore((state) => state.updateNode)
    const [label, setLabel] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (selectedNode) {
            setLabel(selectedNode.data.label ?? '')
            setDescription(selectedNode.data.description ?? '')
        }
    }, [selectedNode])

    if (!selectedNode) return null


    const handleSave = () => {
        updateNode(selectedNode.id, { label, description })
        onClose()
    }

    return (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l p-4 z-50">
            <h2 className="text-xl mb-4">编辑节点属性</h2>
            <div className="mb-4">
                <label className="block mb-1">标签</label>
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1">描述</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 rounded"
                />
            </div>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                保存
            </button>
            <button onClick={onClose} className="px-4 py-2 border rounded">
                取消
            </button>
        </div>
    )
}
