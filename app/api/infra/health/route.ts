import { NextResponse } from 'next/server'
import { mongoPing } from '@/lib/db'
import { runCypher } from '@/lib/neo4j'
import { getQdrant } from '@/lib/qdrant'
import { initApp } from '@/lib/init'

export const runtime = 'nodejs'

export async function GET() {
    await initApp() // 确保初始化已完成

    const result = {
        mongodb: false,
        neo4j: false,
        qdrant: false,
    }

    try {
        result.mongodb = await mongoPing()
    } catch {}

    try {
        await runCypher('RETURN 1 AS ok')
        result.neo4j = true
    } catch {}

    try {
        await getQdrant().getCollections()
        result.qdrant = true
    } catch {}

    const ok = result.mongodb && result.neo4j && result.qdrant
    return NextResponse.json(result, { status: ok ? 200 : 500 })
}
