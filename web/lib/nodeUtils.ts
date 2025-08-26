import {GraphNodeData} from '@/types/GraphNodeData'
import {NodeMetadata} from '@/lib/node'

let nodeCount = 0

export function createThoughtNode(
    x?: number,
    y?: number,
    data: Partial<GraphNodeData> = {},
): {
    id: string
    type: string
    position: { x: number; y: number }
    data: { title: string; description: string; node_metadata: NodeMetadata; color: string; highlight: boolean; role: string }
} {
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
            description: data.description ?? '点击展开思维分支',
            node_metadata: { tags: data.node_metadata?.tags ?? ['默认'], ...data.node_metadata },
            color: data.color ?? '#000000',
            highlight: false,
            role: data.role ?? 'normal',
        },
    }
}
