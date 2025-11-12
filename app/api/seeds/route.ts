// app/api/seeds/route.ts
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Seed from '@/models/Seed'
import { runCypher } from '@/lib/neo4j'

export const runtime = 'nodejs'

// GET /api/seeds?q=keyword
export async function GET(req: Request) {
    await connectDB()
    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    
    let query: any = {}
    if (q) {
        query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
        ]
    }
    
    const data = await Seed.find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean()
    
    return NextResponse.json({ data })
}

// POST /api/seeds { title, description? }
export async function POST(req: Request) {
    await connectDB()
    const b = await req.json().catch(()=> ({} as any))
    const title = (b.title ?? '').trim()
    const description = (b.description ?? null) as string|null
    
    if (!title) {
        return NextResponse.json({ error: 'title required' }, { status: 422 })
    }

    const seed = await Seed.create({ title, description })
    const seedId = seed._id.toString()
    
    // 同步到 Neo4j
    await runCypher(
        'MERGE (s:Seed {id: $id}) SET s.title=$title, s.description=$desc, s.createdAt=timestamp()',
        { id: seedId, title: seed.title, desc: seed.description ?? '' }
    )
    
    return NextResponse.json({ data: seed }, { status: 201 })
}