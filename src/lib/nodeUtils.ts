import {GraphNodeData} from '@/models/GraphNodeData'
import {GraphNode} from '@/models/GraphNode'
import { v4 as uuidv4 } from 'uuid'

export function createThoughtNode(
    x: number,
    y: number,
    data: Partial<GraphNodeData>
): GraphNode {
    const title = data.title || '新想法'
    return {
        id: uuidv4(),
        type: 'thoughtCard',
        position: { x, y },
        data: {
            ...data,
            title,
            label: title, // <== 这里强制让 label 等于 title
            color: data.color || '#4ade80',
        },
    }
}
