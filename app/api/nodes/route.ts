// app/api/nodes/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { runCypher } from '@/lib/neo4j'
import { embedText } from '@/lib/embedding'
import { upsertVector } from '@/lib/qdrant'

export const runtime = 'nodejs'

// GET /api/nodes?seedId=1
export async function GET(req: Request) {
    const sp = new URL(req.url).searchParams
    const seedId = sp.get('seedId')
    const where = seedId ? { seedId: Number(seedId) } : undefined
    const data = await prisma.node.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 200,
    })
    return NextResponse.json({ data })
}

// POST /api/nodes
// body: { seedId: number, parentId?: number, title: string, description?: string, type?: NodeType, content?: any, nodeMetadata?: any }
export async function POST(req: Request) {
    const b = await req.json().catch(()=> ({} as any))
    const seedId = Number(b.seedId)
    const parentId = b.parentId != null ? Number(b.parentId) : null
    const title = (b.title ?? '').trim()
    const description = (b.description ?? null) as string|null
    const type = (b.type ?? 'IDEA') as any
    const content = b.content ?? null
    const nodeMetadata = b.nodeMetadata ?? null

    if (!seedId || !title) return NextResponse.json({ error: 'seedId & title required' }, { status: 422 })

    // 1) Postgres
    const node = await prisma.node.create({
        data: { seedId, parentId: parentId ?? undefined, title, description, type, content, nodeMetadata }
    })

    // 2) Neo4j（节点 + 归属 + 父子）
    await runCypher(`
    MERGE (s:Seed {id: $seedId})
    MERGE (n:Node {id: $id})
    SET n.title=$title, n.type=$type, n.createdAt=timestamp()
    MERGE (s)-[:HAS_NODE]->(n)
    WITH n
    CALL {
      WITH n
      WITH n, $parentId as pid
      WHERE pid IS NOT NULL
      MERGE (p:Node {id: pid})
      MERGE (p)-[:PARENT_OF]->(n)
      RETURN 1
    }
    RETURN n
  `, { seedId, id: node.id, title, type, parentId })

    // 3) Qdrant（向量 upsert）
    const text = [title, description ?? '', typeof content === 'string' ? content : ''].filter(Boolean).join('\n\n')
    if (text) {
        const vec = await embedText(text)
        await upsertVector(node.id, vec, { nodeId: node.id, seedId: node.seedId, type: node.type, title: node.title })
    }

    return NextResponse.json({ data: node }, { status: 201 })
}