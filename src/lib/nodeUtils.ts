import {GraphNodeData} from '@/models/GraphNodeData'
import {GraphNode} from '@/models/GraphNode'
import { v4 as uuidv4 } from 'uuid'

export const createNode = (x: number, y: number, data: Partial<GraphNodeData> = {}): GraphNode => ({
    id: uuidv4(),
    type: 'customNode',
    position: { x, y },
    data: {
        label: data.label ?? '新节点',
        description: data.description ?? '',
        color: data.color ?? '#4ade80',
    },
})
