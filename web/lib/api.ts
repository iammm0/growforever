import axios from 'axios'
import {Seed, SeedCreateRequest, ExpandRequest, ExpandResponse} from '@/lib/seed'
import {NodeCreateRequest, Node} from '@/lib/node'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
})

export async function createSeed(data: SeedCreateRequest): Promise<Seed> {
    const res = await api.post('/seeds', data)
    return res.data
}

export async function expandSeed(seedId: number, data: ExpandRequest): Promise<ExpandResponse> {
    const res = await api.post(`/seeds/${seedId}/expand`, data)
    return res.data
}

export async function expandNode(
    seedId: number,
    nodeId: number,
    data: ExpandRequest,
): Promise<ExpandResponse> {
    const res = await api.post(`/seeds/${seedId}/nodes/${nodeId}/expand`, data)
    return res.data
}

export async function createNode(seedId: number, data: NodeCreateRequest): Promise<Node> {
    const res = await api.post(`/seeds/${seedId}/nodes`, data)
    return res.data
}

export default api
