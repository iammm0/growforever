import {NodeMetadata} from '@/lib/node'

export interface GraphNodeData {
    title: string
    description?: string
    node_metadata?: NodeMetadata
    highlight?: boolean
    color?: string
    role: string
}
