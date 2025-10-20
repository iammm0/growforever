import neo4j, { Driver, Session } from 'neo4j-driver'

let driver: Driver | null = null

function required(name: string) {
    const v = process.env[name]
    if (!v) throw new Error(`[neo4j] Missing env ${name}`)
    return v
}

/** 获取全局单例 Driver */
export function getNeo4j(): Driver {
    if (!driver) {
        driver = neo4j.driver(
            required('NEO4J_URI'),
            neo4j.auth.basic(required('NEO4J_USER'), required('NEO4J_PASSWORD')),
            // 关闭大整数封装，直接返回 JS number
            { disableLosslessIntegers: true }
        )
    }
    return driver
}

/** 运行 Cypher；自动开关 session */
export async function runCypher<T = any>(query: string, params: Record<string, any> = {}): Promise<T[]> {
    const d = getNeo4j()
    const session: Session = d.session()
    try {
        const res = await session.run(query, params)
        // 把 Record 转成普通对象
        return res.records.map((r) => r.toObject()) as T[]
    } finally {
        await session.close()
    }
}

/** 简单健康检查 */
export async function neo4jPing(): Promise<boolean> {
    try {
        await runCypher('RETURN 1 AS ok')
        return true
    } catch {
        return false
    }
}

/** 可选：优雅关闭（在自定义脚本/进程退出时调用） */
export async function closeNeo4j(): Promise<void> {
    if (driver) {
        await driver.close()
        driver = null
    }
}
