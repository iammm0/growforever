import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type GNNRequestBody = {
    text: string
    seedId?: number
}

type GNNNode = {
    id: string
    title: string
    description?: string
    type: 'IDEA' | 'MEMORY' | 'EMOTION' | 'FEATURE' | 'EVENT' | 'USER_DEFINED'
    content?: any
    nodeMetadata?: any
    position?: { x: number; y: number }
}

type GNNEdge = {
    id: string
    sourceId: string
    targetId: string
    type: 'RELATION' | 'CAUSAL' | 'SEQUENTIAL' | 'ASSOCIATION' | 'USER_DEFINED'
    label?: string
    properties?: any
}

type GNNResponse = {
    nodes: GNNNode[]
    edges: GNNEdge[]
    seedId: number
}

// POST /api/gnn
// body: { text: string, seedId?: number }
export async function POST(req: Request) {
    try {
        const body: GNNRequestBody = await req.json()
        const { text, seedId } = body

        if (!text?.trim()) {
            return NextResponse.json({ error: '文本内容不能为空' }, { status: 400 })
        }

        // 代理到本地 GNN 服务并适配返回结构
        const adapted = await proxyAndAdaptGNN(text, seedId)
        return NextResponse.json(adapted)
    } catch (error) {
        console.error('GNN API错误:', error)
        return NextResponse.json({ error: 'GNN服务调用失败' }, { status: 500 })
    }
}

// 代理本地 GNN 服务并适配返回格式
async function proxyAndAdaptGNN(text: string, seedId?: number): Promise<GNNResponse> {
    const endpoint = 'http://gnn-service:8000/process_text/'
    const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
    })

    if (!r.ok) {
        const msg = await r.text().catch(() => '')
        throw new Error(`GNN upstream error: ${r.status} ${msg}`)
    }

    const raw = (await r.json()) as {
        nodes?: Array<{
            id: string
            type: string
            data: {
                title: string
                description: string
                tags: string[]
                highlight: boolean
                magnified: boolean
            }
            position: { x: number; y: number }
        }>
        edges?: [string, string, { relationship?: string }][]
    }

    // 使用GNN服务返回的节点数据，但调整位置布局
    const nodes: GNNNode[] = (raw.nodes ?? []).map((node, idx) => {
        const mappedType = mapEntityLabelToNodeType(node.data.tags[0] || 'USER_DEFINED')
        return {
            id: node.id,
            title: node.data.title,
            description: node.data.description,
            type: mappedType,
            nodeMetadata: { 
                tags: node.data.tags,
                highlight: node.data.highlight,
                magnified: node.data.magnified
            },
            position: calculateNodePosition(node, idx, raw.nodes?.length || 0),
        }
    })

    const edges: GNNEdge[] = (raw.edges ?? []).map(([src, tgt, meta], i) => {
        const rel = meta?.relationship ?? 'RELATION'
        // 使用更唯一的ID生成方式，包含时间戳和随机数
        const uniqueId = `${src}-${tgt}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        return {
            id: uniqueId,
            sourceId: src,
            targetId: tgt,
            type: 'RELATION',
            label: rel,
            properties: { relationship: rel },
        }
    })

    return { nodes, edges, seedId: seedId ?? 1 }
}

function mapEntityLabelToNodeType(label: string): GNNNode['type'] {
    switch (label?.toUpperCase()) {
        case 'PERSON':
            return 'IDEA'
        case 'ORG':
        case 'GPE':
        case 'LOC':
            return 'FEATURE'
        case 'EVENT':
            return 'EVENT'
        case 'EMOTION':
            return 'EMOTION'
        default:
            return 'USER_DEFINED'
    }
}

// 节点自动布局算法
function calculateNodePosition(node: any, index: number, totalNodes: number): { x: number; y: number } {
    const NODE_SPACING = 250
    const CENTER_X = 400
    const CENTER_Y = 300
    
    if (totalNodes <= 1) {
        return { x: CENTER_X, y: CENTER_Y }
    }
    
    if (totalNodes <= 4) {
        // 小数量节点：网格布局
        const cols = Math.ceil(Math.sqrt(totalNodes))
        const row = Math.floor(index / cols)
        const col = index % cols
        return {
            x: CENTER_X - (cols - 1) * NODE_SPACING / 2 + col * NODE_SPACING,
            y: CENTER_Y - (Math.ceil(totalNodes / cols) - 1) * NODE_SPACING / 2 + row * NODE_SPACING
        }
    }
    
    // 大数量节点：圆形布局
    const radius = Math.max(200, totalNodes * 30)
    const angle = (2 * Math.PI * index) / totalNodes
    return {
        x: CENTER_X + radius * Math.cos(angle),
        y: CENTER_Y + radius * Math.sin(angle)
    }
}
