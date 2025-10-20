// app/api/seeds/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { runCypher } from '@/lib/neo4j'

export const runtime = 'nodejs'

// GET /api/seeds?q=keyword
export async function GET(req: Request) {
    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    const data = await prisma.seed.findMany({
        where: q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100,
    })
    return NextResponse.json({ data })
}

// POST /api/seeds { title, description? }
export async function POST(req: Request) {
    const b = await req.json().catch(()=> ({} as any))
    const title = (b.title ?? '').trim()
    const description = (b.description ?? null) as string|null
    if (!title) return NextResponse.json({ error: 'title required' }, { status: 422 })

    const seed = await prisma.seed.create({ data: { title, description } })
    // 同步到 Neo4j
    await runCypher(
        'MERGE (s:Seed {id: $id}) SET s.title=$title, s.description=$desc, s.createdAt=timestamp()',
        { id: seed.id, title: seed.title, desc: seed.description ?? '' }
    )
    return NextResponse.json({ data: seed }, { status: 201 })
}