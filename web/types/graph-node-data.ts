import {NodeMetadata} from '@/core/model/node'

export interface GraphNodeData {
    title: string
    description?: string
    node_metadata?: NodeMetadata
    highlight?: boolean
    color?: string
    role: string
    depth?: number
    prompt?: string
    order?: number | string
    magnified?: boolean
    expandedText?: string
}
