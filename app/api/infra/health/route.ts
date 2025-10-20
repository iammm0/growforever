import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { runCypher } from '@/lib/neo4j'
import { getQdrant } from '@/lib/qdrant'

export const runtime = 'nodejs'

export async function GET() {
    const result = {
        postgres: { ok: false as boolean, error: '' as string | undefined },
        neo4j:    { ok: false as boolean, error: '' as string | undefined },
        qdrant:   { ok: false as boolean, error: '' as string | undefined },
        ts: Date.now(),
    }

    // PG
    try {
        await prisma.$queryRawUnsafe('SELECT 1')
        result.postgres.ok = true
    } catch (e:any) {
        result.postgres.error = e?.message ?? String(e)
    }

    // Neo4j
    try {
        await runCypher('RETURN 1 AS ok')
        result.neo4j.ok = true
    } catch (e:any) {
        result.neo4j.error = e?.message ?? String(e)
    }

    // Qdrant
    try {
        const q = getQdrant()
        await q.getCollections()
        result.qdrant.ok = true
    } catch (e:any) {
        result.qdrant.error = e?.message ?? String(e)
    }

    const status = result.postgres.ok && result.neo4j.ok && result.qdrant.ok ? 200 : 500
    return NextResponse.json(result, { status })
}