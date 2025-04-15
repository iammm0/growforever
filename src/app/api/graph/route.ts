import api from '@/lib/axios'
import {NodeCreateRequest} from "@/lib/node";

// 创建节点
export const createNode = async (data: NodeCreateRequest)=> {
    const res = await api.post('/nodes/', data)
    return res.data
}

// 获取节点
export const getNodeById = async (id: number) => {
    const res = await api.get(`/nodes/${id}`)
    return res.data
}

// 更新节点
export const updateNode = async (
    id: number,
    data: Partial<Omit<NodeCreateRequest, 'title'> & { title?: string }>
) => {
    const res = await api.patch(`/nodes/${id}`, data)
    return res.data
}
