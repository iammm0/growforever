export type EdgeType =
    | 'relation'
    | 'causal'
    | 'sequential'
    | 'association'
    | 'user_defined'

export interface Edge {
    id: number
    source_id: number
    target_id: number
    type: EdgeType
    label?: string | null
    properties?: Record<string, unknown>
    created_at: string
    updated_at?: string | null
}
