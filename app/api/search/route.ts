// app/api/search/route.ts
import { NextResponse } from 'next/server'
import { embedText } from '@/lib/embedding'
import { searchVectors } from '@/lib/qdrant'
import connectDB from '@/lib/mongodb'
import Node from '@/models/Node'
import mongoose from 'mongoose'

export const runtime = 'nodejs'

// GET /api/search?q=文本&limit=10
export async function GET(req: Request) {
    await connectDB()
    const sp = new URL(req.url).searchParams
    const q = sp.get('q')?.trim() || ''
    const limit = Number(sp.get('limit') || 10)
    
    if (!q) {
        return NextResponse.json({ data: [] })
    }

    const vec = await embedText(q)
    const hits = await searchVectors(vec, limit)

    const ids = hits
        .map(h => h.id)
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))
    
    const nodes = await Node.find({ _id: { $in: ids } }).lean()
    const byId = new Map(nodes.map(n => [n._id.toString(), n]))
    
    const data = hits.map(h => ({
        score: h.score,
        node: byId.get(h.id) ?? null,
        payload: h.payload ?? null,
    }))

    return NextResponse.json({ data })
}