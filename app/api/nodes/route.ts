// app/api/nodes/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Node from '@/models/Node'
import { runCypher } from '@/lib/neo4j'
import { embedText } from '@/lib/embedding'
import { upsertVector } from '@/lib/qdrant'
import mongoose from 'mongoose'

export const runtime = 'nodejs'

// GET /api/nodes?seedId=xxx
export async function GET(req: Request) {
    await connectDB()
    const sp = new URL(req.url).searchParams
    const seedId = sp.get('seedId')
    
    const query: any = {}
    if (seedId && mongoose.Types.ObjectId.isValid(seedId)) {
        query.seedId = new mongoose.Types.ObjectId(seedId)
    }
    
    const data = await Node.find(query)
        .sort({ createdAt: -1 })
        .limit(200)
        .lean()
    
    return NextResponse.json({ data })
}

// POST /api/nodes
// body: { seedId: string, parentId?: string, title: string, description?: string, type?: NodeType, content?: any, nodeMetadata?: any }
export async function POST(req: Request) {
    await connectDB()
    const b = await req.json().catch(()=> ({} as any))
    const seedId = b.seedId
    const parentId = b.parentId
    const title = (b.title ?? '').trim()
    const description = (b.description ?? null) as string|null
    const type = (b.type ?? 'IDEA') as any
    const content = b.content ?? null
    const nodeMetadata = b.nodeMetadata ?? null

    if (!seedId || !title || !mongoose.Types.ObjectId.isValid(seedId)) {
        return NextResponse.json({ error: 'seedId & title required' }, { status: 422 })
    }

    if (parentId && !mongoose.Types.ObjectId.isValid(parentId)) {
        return NextResponse.json({ error: 'invalid parentId' }, { status: 422 })
    }

    // 1) MongoDB
    const nodeData: any = {
        seedId: new mongoose.Types.ObjectId(seedId),
        title,
        description,
        type,
        content,
        nodeMetadata,
    }
    if (parentId) {
        nodeData.parentId = new mongoose.Types.ObjectId(parentId)
    }

    const node = await Node.create(nodeData)
    const nodeId = node._id.toString()

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
      WHERE pid IS NOT NULL AND pid <> ''
      MERGE (p:Node {id: pid})
      MERGE (p)-[:PARENT_OF]->(n)
      RETURN 1
    }
    RETURN n
  `, { seedId, id: nodeId, title, type, parentId: parentId || null })

    // 3) Qdrant（向量 upsert）
    const text = [title, description ?? '', typeof content === 'string' ? content : ''].filter(Boolean).join('\n\n')
    if (text) {
        const vec = await embedText(text)
        await upsertVector(nodeId, vec, { nodeId, seedId, type: node.type, title: node.title })
    }

    return NextResponse.json({ data: node }, { status: 201 })
}