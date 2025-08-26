export interface SeedCreateRequest {
    title: string
    description?: string
}

export interface Seed {
    id: number
    title: string
    description?: string | null
    created_at: string
}

export interface ExpandRequest {
    prompt: string
}

export interface ExpandResponse {
    new_node_ids: number[]
}
