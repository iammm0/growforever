// lib/init.ts
/**
 * 应用初始化模块 —— 模拟 FastAPI lifespan
 * 在 Next.js 服务启动后首次调用时连接：
 *   - PostgreSQL (Prisma)
 *   - Neo4j
 *   - Qdrant
 */

import { prisma } from '@/lib/db'
import { getNeo4j, closeNeo4j } from '@/lib/neo4j'
import { getQdrant } from '@/lib/qdrant'

let initialized = false

export async function initApp() {
    if (initialized) return
    initialized = true

    console.log('🚀 [growforever] initializing services...')

    // 1️⃣ PostgreSQL
    try {
        await prisma.$queryRawUnsafe('SELECT 1')
        console.log('✅ PostgreSQL connected')
    } catch (e: any) {
        console.error('❌ PostgreSQL connect failed:', e.message)
        process.exit(1)
    }

    // 2️⃣ Neo4j
    try {
        const driver = getNeo4j()
        await driver.verifyConnectivity()
        console.log('✅ Neo4j connected')
    } catch (e: any) {
        console.error('❌ Neo4j connect failed:', e.message)
        process.exit(1)
    }

    // 3️⃣ Qdrant
    try {
        const q = getQdrant()
        await q.getCollections()
        console.log('✅ Qdrant connected')
    } catch (e: any) {
        console.error('❌ Qdrant connect failed:', e.message)
        process.exit(1)
    }

    // 监听退出信号，优雅关闭
    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)

    console.log('✨ All services initialized')
}

async function shutdown() {
    console.log('\n🧹 Shutting down...')
    try {
        await closeNeo4j()
        await prisma.$disconnect()
        console.log('✅ Graceful shutdown completed')
    } catch (e) {
        console.error('❌ Shutdown error:', e)
    } finally {
        process.exit(0)
    }
}
