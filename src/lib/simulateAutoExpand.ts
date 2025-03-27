'use client'

import { Edge, Node } from 'reactflow'
import { nanoid } from 'nanoid'
import { useGraphStore } from '@/lib/graphStore'

export async function simulateAutoExpand(rootId: string) {
    const {
        growMode,
        nodes,
        addNode,
        addEdge,
        setAutoExpanding,
    } = useGraphStore.getState()

    const root = nodes.find(n => n.id === rootId)
    if (!root) return

    setAutoExpanding(true)

    const loopCount = growMode === 'fury' ? 15 : 5
    const delay = growMode === 'fury' ? 100 : 800

    let currentParent = root

    for (let i = 0; i < loopCount; i++) {
        const id = nanoid()
        const x = currentParent.position.x + 200 + Math.random() * 60
        const y = currentParent.position.y + (Math.random() - 0.5) * 100

        const newNode: Node = {
            id,
            type: 'thought',
            position: { x, y },
            data: {
                title: `想法 ${i + 1}`,
                summary: growMode === 'fury' ? '狂暴扩展' : '自由扩展',
                tags: [growMode],
                highlight: false,
            },
        }

        const newEdge: Edge = {
            id: `${currentParent.id}-${id}`,
            source: currentParent.id,
            target: id,
            type: 'default',
        }

        addNode(newNode)
        addEdge(newEdge)

        currentParent = newNode
        await new Promise(res => setTimeout(res, delay))
    }

    setAutoExpanding(false)
}
