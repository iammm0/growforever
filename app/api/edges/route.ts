// app/api/edges/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Edge from '@/models/Edge'
import { runCypher } from '@/lib/neo4j'
import mongoose from 'mongoose'

export const runtime = 'nodejs'

// POST /api/edges
// body: { sourceId: string, targetId: string, type?: EdgeType, label?: string, properties?: any }
export async function POST(req: Request) {
    await connectDB()
    const b = await req.json().catch(()=> ({} as any))
    const sourceId = b.sourceId
    const targetId = b.targetId
    const type = (b.type ?? 'RELATION') as any
    const label = (b.label ?? null) as string|null
    const properties = b.properties ?? null
    
    if (!sourceId || !targetId) {
        return NextResponse.json({ error: 'sourceId & targetId required' }, { status: 422 })
    }

    if (!mongoose.Types.ObjectId.isValid(sourceId) || !mongoose.Types.ObjectId.isValid(targetId)) {
        return NextResponse.json({ error: 'invalid sourceId or targetId' }, { status: 422 })
    }

    // 1) MongoDB
    const edge = await Edge.create({
        sourceId: new mongoose.Types.ObjectId(sourceId),
        targetId: new mongoose.Types.ObjectId(targetId),
        type,
        label,
        properties,
    })

    // 2) Neo4j
    await runCypher(`
    MERGE (a:Node {id: $from})
    MERGE (b:Node {id: $to})
    MERGE (a)-[r:REL {id: $id}]->(b)
    SET r.type=$type, r.label=$label, r.updatedAt=timestamp(), r.properties = coalesce(r.properties, {}) + $props
  `, { from: sourceId, to: targetId, id: edge._id.toString(), type, label, props: properties ?? {} })

    return NextResponse.json({ data: edge }, { status: 201 })
}