import { Node } from 'reactflow'
import { GraphNodeData } from '@/types/GraphNodeData'

let nodeCount = 0

export function createThoughtNode(
    x?: number,
    y?: number,
    data: Partial<GraphNodeData> = {}
): Node<GraphNodeData> {
    nodeCount++

    return {
        id: `node-${Date.now()}-${nodeCount}`,
        type: 'thought',
        position: {
            x: x ?? (100 + (nodeCount % 5) * 180),
            y: y ?? (100 + Math.floor(nodeCount / 5) * 120),
        },
        data: {
            title: data.title ?? `新想法 #${nodeCount}`,
            summary: data.summary ?? '点击展开思维分支',
            tags: data.tags ?? ['默认'],
            color: data.color ?? '#000000',
            highlight: false,
        },
    }
}