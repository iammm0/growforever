import { NextResponse } from 'next/server'

// 你也可以换 zod，这里用最小依赖校验以简化落地
type Body = {
    mode?: 'rewrite' | 'continue' | 'summarize'
    input: string
    hints?: string[]
    temperature?: number
    maxTokens?: number
}

const env = {
    BASE: process.env.LLM_BASE_URL ?? '',
    KEY: process.env.LLM_API_KEY ?? '',
    MODEL: process.env.LLM_MODEL ?? 'gpt-4o',
    PERSONA: process.env.PERSONA_PROMPT ?? '',
}

function bad(msg: string, status = 400) {
    return NextResponse.json({ error: msg }, { status })
}

function modeInstruction(mode: NonNullable<Body['mode']>) {
    switch (mode) {
        case 'rewrite':
            return 'Rewrite the user text: improve clarity, tone, cohesion; preserve meaning; output Chinese.'
        case 'summarize':
            return 'Summarize the user text in concise Chinese bullet points with key takeaways.'
        case 'continue':
        default:
            return 'Continue the user text naturally in Chinese; keep style consistent.'
    }
}

function buildMessages(body: Required<Pick<Body, 'mode' | 'input'>> & Pick<Body, 'hints'>) {
    const msgs: Array<{ role: 'system' | 'user'; content: string }> = []
    if (env.PERSONA) msgs.push({ role: 'system', content: env.PERSONA })
    msgs.push({ role: 'system', content: modeInstruction(body.mode) })
    if (body.hints?.length) {
        msgs.push({ role: 'system', content: `Hints: ${body.hints.join(' | ')}` })
    }
    msgs.push({ role: 'user', content: body.input })
    return msgs
}

export const runtime = 'nodejs' // 如果你希望走 Edge，可改 'edge'（但注意 Node 兼容 fetch 流解析）

export async function POST(req: Request) {
    const url = new URL(req.url)
    const wantStream = url.searchParams.get('stream') === '1'

    if (!env.BASE || !env.KEY) return bad('LLM_BASE_URL or LLM_API_KEY not configured', 500)

    let data: Body
    try {
        data = await req.json()
    } catch {
        return bad('Invalid JSON', 400)
    }

    const mode = data.mode ?? 'rewrite'
    const input = (data.input ?? '').trim()
    if (!input) return bad('`input` is required', 422)

    const temperature = typeof data.temperature === 'number' ? data.temperature : 0.7
    const max_tokens = Number.isInteger(data.maxTokens) ? data.maxTokens : 512

    const payload = {
        model: env.MODEL,
        temperature,
        max_tokens,
        stream: wantStream,
        messages: buildMessages({ mode, input, hints: data.hints }),
    }

    // 直连 OpenAI 兼容接口（jeniya.cn 声称兼容 /v1/chat/completions）
    const r = await fetch(env.BASE, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${env.KEY}`,
        },
        body: JSON.stringify(payload),
    })

    // 非流式：把上游返回转成简洁结构
    if (!wantStream) {
        const raw = await r.json().catch(() => ({}))
        const text =
            raw?.choices?.[0]?.message?.content ??
            raw?.choices?.[0]?.delta?.content ??
            ''
        return NextResponse.json({ text, raw }, { status: r.status })
    }

    // 流式：直接透传 SSE
    if (!r.body) {
        return bad('Upstream no body', 502)
    }

    // 有些服务 content-type 不带 charset，EventSource 也能吃，这里保持上游原样
    const headers = new Headers({
        'Content-Type': r.headers.get('content-type') ?? 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
    })

    // 直接把上游的 ReadableStream 转交给客户端（零拷贝）
    return new Response(r.body, { status: r.status, headers })
}