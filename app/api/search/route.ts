// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { embedText } from '@/lib/embedding'
import { searchVectors } from '@/lib/qdrant'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

// GET /api/search?q=文本&limit=10
export async function GET(req: Request) {
    const sp = new URL(req.url).searchParams
    const q = sp.get('q')?.trim() || ''
    const limit = Number(sp.get('limit') || 10)
    if (!q) return NextResponse.json({ data: [] })

    const vec = await embedText(q)
    const hits = await searchVectors(vec, limit)

    const ids = hits.map(h => Number(h.id)).filter(Boolean)
    const nodes = await prisma.node.findMany({ where: { id: { in: ids } } })
    const byId = new Map(nodes.map(n => [n.id, n]))
    const data = hits.map(h => ({
        score: h.score,
        node: byId.get(Number(h.id)) ?? null,
        payload: h.payload ?? null,
    }))

    return NextResponse.json({ data })
}