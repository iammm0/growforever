// lib/embedding.ts
/**
 * 通用文本向量编码器
 * 支持：
 *  - OpenAI / 兼容接口（默认）
 *  - growforever-api 内部编码服务（GF_ENCODER_URL）
 */

import OpenAI from 'openai'

const OPENAI_BASE = process.env.EMBED_BASE_URL || 'https://api.openai.com/v1'
const OPENAI_KEY  = process.env.EMBED_API_KEY || ''
const OPENAI_MODEL= process.env.EMBED_MODEL || 'text-embedding-3-small'

// 可选：你的自建编码器
const GF_ENCODER_URL = process.env.GF_ENCODER_URL || ''   // 例如 http://127.0.0.1:8000/embed
const GF_ENCODER_KEY = process.env.GF_ENCODER_KEY || ''

/**
 * 获取 OpenAI 客户端（延迟创建）
 */
let openai: OpenAI | null = null
function getClient() {
    if (!openai) openai = new OpenAI({ apiKey: OPENAI_KEY, baseURL: OPENAI_BASE })
    return openai
}

/**
 * 统一生成向量
 * @param input 任意字符串或字符串数组
 * @returns number[] 向量数组
 */
export async function embedText(input: string | string[]): Promise<number[]> {
    const text = Array.isArray(input) ? input.join('\n') : input
    const clean = text.trim()
    if (!clean) throw new Error('Empty text for embedding')

    // 优先使用自建编码服务
    if (GF_ENCODER_URL) {
        const r = await fetch(GF_ENCODER_URL, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                ...(GF_ENCODER_KEY ? { authorization: `Bearer ${GF_ENCODER_KEY}` } : {}),
            },
            body: JSON.stringify({ input: clean }),
        })

        if (!r.ok) {
            const err = await r.text().catch(() => '')
            throw new Error(`[growforever-api] ${r.status}: ${err}`)
        }

        const j = await r.json().catch(() => ({}))
        // growforever-api 约定返回 { vector: [...] } 或 { embedding: [...] }
        const vec =
            j.vector ||
            j.embedding ||
            j.data?.[0]?.embedding ||
            null

        if (!Array.isArray(vec)) {
            throw new Error('Invalid embedding response from GF_ENCODER_URL')
        }
        return vec
    }

    // 否则使用 OpenAI 兼容接口
    const client = getClient()
    const res = await client.embeddings.create({
        model: OPENAI_MODEL,
        input: clean,
    })

    const v = res.data?.[0]?.embedding
    if (!v) throw new Error('Empty embedding result')
    return v
}