export interface NodeContent {
    media?: string[]
    links?: string[]
    rich_text?: string
}

export interface NodeMetadata {
    tags?: string[]
    emotions?: string[]
    vector?: number[]
    extra?: Record<string, string>
}

export type NodeType =
    | 'idea'
    | 'memory'
    | 'emotion'
    | 'feature'
    | 'event'
    | 'user_defined'

export interface NodeCreateRequest {
    title: string
    description?: string
    type?: NodeType
    content?: NodeContent
    node_metadata?: NodeMetadata
}

export interface Node {
    id: number
    seed_id: number
    parent_id?: number | null
    title: string
    description?: string | null
    type: NodeType
    content?: NodeContent
    node_metadata?: NodeMetadata
    created_at: string
    updated_at?: string | null
}
