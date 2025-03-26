// 控制面板
'use client'

import { useGraphStore } from '@/lib/graphStore'
import { v4 as uuidv4 } from 'uuid'

export default function ControlPanel() {
    const { addNode, reset, nodes, edges } = useGraphStore()

    const handleAddNode = () => {
        addNode({
            id: uuidv4(),
            type: 'default',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: `节点 ${nodes.length + 1}` },
        })
    }

    const handleExport = () => {
        const dataStr = JSON.stringify({ nodes, edges }, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'graph-data.json'
        link.click()
        URL.revokeObjectURL(url)
    }

    const handleClear = () => reset()

    return (
        <div className="flex gap-4 p-4 border-b">
            <button onClick={handleAddNode} className="px-4 py-2 bg-blue-500 text-white rounded">
                新增节点
            </button>
            <button onClick={handleExport} className="px-4 py-2 bg-green-500 text-white rounded">
                导出 JSON
            </button>
            <button onClick={handleClear} className="px-4 py-2 bg-red-500 text-white rounded">
                清空
            </button>
        </div>
    )
}
