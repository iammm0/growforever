import { PrismaClient } from '@prisma/client'

// 解决本地开发热更新多实例问题
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

/** 简单健康检查 */
export async function pgPing(): Promise<boolean> {
    try {
        // 用 $queryRawUnsafe 避免额外类型要求
        await prisma.$queryRawUnsafe('SELECT 1')
        return true
    } catch {
        return false
    }
}