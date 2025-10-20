import { QdrantClient } from '@qdrant/js-client-rest'

let client: QdrantClient | null = null

function required(name: string) {
    const v = process.env[name]
    if (!v) throw new Error(`[qdrant] Missing env ${name}`)
    return v
}

/** 全局单例 Qdrant 客户端 */
export function getQdrant(): QdrantClient {
    if (!client) {
        client = new QdrantClient({
            url: required('QDRANT_URL'),
            apiKey: process.env.QDRANT_API_KEY || undefined, // 本地可为空
        })
    }
    return client
}

/** 确保集合存在（幂等） */
export async function ensureCollection(): Promise<void> {
    const name = required('QDRANT_COLLECTION')
    const dim = Number(process.env.QDRANT_VECTOR_SIZE || 1536)
    const distance = (process.env.QDRANT_DISTANCE || 'Cosine') as 'Cosine' | 'Dot' | 'Euclid'

    const q = getQdrant()
    const list = await q.getCollections()
    const exists = list.collections?.some((c) => c.name === name)
    if (!exists) {
        await q.createCollection(name, {
            vectors: { size: dim, distance },
        })
        console.log(`[Qdrant] ✅ Collection '${name}' created (${dim}d, ${distance})`)
    }
}

/** upsert 向量（id 建议用业务主键，如 node.id） */
export async function upsertVector(
    id: string | number,
    vector: number[],
    payload: Record<string, any> = {}
): Promise<void> {
    await ensureCollection()
    const q = getQdrant()
    await q.upsert(process.env.QDRANT_COLLECTION!, {
        points: [{ id, vector, payload }],
    })
}

/** 相似度搜索 */
export async function searchVectors(
    vector: number[],
    limit = 10,
    filter?: any
): Promise<
    Array<{
        id: string | number
        score: number
        payload?: Record<string, any>
    }>
> {
    await ensureCollection()
    const q = getQdrant()
    const res: any = await q.search(process.env.QDRANT_COLLECTION!, {
        vector,
        limit,
        filter,
    })
    // 转换为简洁对象数组
    return res?.map((p: any) => ({
        id: p.id,
        score: p.score,
        payload: p.payload,
    })) ?? []
}

/** 删除一个向量点（按 id） */
export async function deleteVector(id: string | number): Promise<void> {
    await ensureCollection()
    const q = getQdrant()
    await q.delete(process.env.QDRANT_COLLECTION!, { points: [id] })
}

/** 健康检查 */
export async function qdrantPing(): Promise<boolean> {
    try {
        await getQdrant().getCollections()
        return true
    } catch {
        return false
    }
}