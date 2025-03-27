import { GraphNodeData } from '@/types/GraphNodeData'

let nodeCount = 0

export function createThoughtNode(
    x?: number,
    y?: number,
    data: Partial<GraphNodeData> = {}
): {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: { title: string; summary: string; tags: string[]; color: string; highlight: boolean; role: any }
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
            summary: data.summary ?? '点击展开思维分支',
            tags: data.tags ?? ['默认'],
            color: data.color ?? '#000000',
            highlight: false,
            role: data.role ?? 'normal',
        },
    }
}