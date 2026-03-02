'use client'

/**
 * 前端直接调用 Next.js 内部 API
 * 完全取代 axios；统一使用 fetch()
 */

import { useCallback } from 'react'

export interface SeedCreateRequest {
    title: string
    description?: string
}
export interface ExpandRequest {
    prompt: string
}

export function useSeedApi() {
    // 创建种子
    const createSeed = useCallback(async (data: SeedCreateRequest) => {
        const res = await fetch('/api/seeds', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        const j = await res.json()
        return j.data
    }, [])

    // 扩展种子
    const expandSeed = useCallback(async (seedId: number, data: ExpandRequest) => {
        // 这里假设我们在 Next.js 端有 /api/seeds/[id]/expand/route.ts
        const res = await fetch(`/api/seeds/${seedId}/expand`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error(await res.text())
        const j = await res.json()
        return j.data
    }, [])

    // 如果后面需要创建节点或扩展节点
    const createNode = useCallback(async (seedId: number, data: any) => {
        const res = await fetch(`/api/nodes`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ seedId, ...data }),
        })
        if (!res.ok) throw new Error(await res.text())
        const j = await res.json()
        return j.data
    }, [])

    const expandNode = useCallback(async (nodeId: number) => {
        const res = await fetch(`/api/nodes/${nodeId}/expand`, { method: 'POST' })
        if (!res.ok) throw new Error(await res.text())
        const j = await res.json()
        return j.data
    }, [])

    return { createSeed, expandSeed, createNode, expandNode }
}
