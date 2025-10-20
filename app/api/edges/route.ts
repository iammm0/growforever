// app/api/edges/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { runCypher } from '@/lib/neo4j'

export const runtime = 'nodejs'

// POST /api/edges
// body: { sourceId: number, targetId: number, type?: EdgeType, label?: string, properties?: any }
export async function POST(req: Request) {
    const b = await req.json().catch(()=> ({} as any))
    const sourceId = Number(b.sourceId)
    const targetId = Number(b.targetId)
    const type = (b.type ?? 'RELATION') as any
    const label = (b.label ?? null) as string|null
    const properties = b.properties ?? null
    if (!sourceId || !targetId) return NextResponse.json({ error: 'sourceId & targetId required' }, { status: 422 })

    // 1) PG
    const edge = await prisma.edge.create({ data: { sourceId, targetId, type, label, properties } })

    // 2) Neo4j
    await runCypher(`
    MERGE (a:Node {id: $from})
    MERGE (b:Node {id: $to})
    MERGE (a)-[r:${/* 按类型打 label，不同类型同一类关系可共享标签 */''}REL {id: $id}]->(b)
    SET r.type=$type, r.label=$label, r.updatedAt=timestamp(), r.properties = coalesce(r.properties, {}) + $props
  `, { from: sourceId, to: targetId, id: edge.id, type, label, props: properties ?? {} })

    return NextResponse.json({ data: edge }, { status: 201 })
}