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
