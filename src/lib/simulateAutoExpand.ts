'use client'

import { Edge, Node } from 'reactflow'
import { nanoid } from 'nanoid'
import { useGraphStore } from '@/lib/graphStore'

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// 角度扩散：360° 平均分布
function getSpreadPosition(centerX: number, centerY: number, index: number, total: number, distance: number) {
    const angle = (index / total) * 2 * Math.PI
    return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}


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

    // 控制数量
    const MAX_DEPTH = 4
    const MAX_CHILD_PER_NODE = 6
    const MIN_CHILD_PER_NODE = 3
    const delay = growMode === 'fury' ? 100 : 600

    // 队列用于 BFS 拓展
    const queue: { parent: Node; depth: number }[] = [{ parent: root, depth: 1 }]

    while (queue.length > 0) {
        const { parent, depth } = queue.shift()!

        if (depth > MAX_DEPTH) continue

        const childCount = getRandomInt(MIN_CHILD_PER_NODE, MAX_CHILD_PER_NODE)

        for (let i = 0; i < childCount; i++) {
            const id = nanoid()
            const pos = getSpreadPosition(parent.position.x, parent.position.y, i, childCount, 360)

            const newNode: Node = {
                id,
                type: 'thought',
                position: pos,
                data: {
                    title: `想法 ${id.slice(0, 5)}`,
                    summary: growMode === 'fury' ? '狂暴扩展' : '自由扩展',
                    tags: [growMode],
                    highlight: false,
                },
            }

            const newEdge: Edge = {
                id: `${parent.id}-${id}`,
                source: parent.id,
                target: id,
                type: 'default',
            }

            addNode(newNode)
            addEdge(newEdge)

            // 子节点进入队列递归扩展
            queue.push({ parent: newNode, depth: depth + 1 })

            await sleep(delay)
        }
    }

    setAutoExpanding(false)
}
