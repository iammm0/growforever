'use client'

import { Node } from 'reactflow'
import { nanoid } from 'nanoid'
import {useGraphStore} from "@/src/lib/graphStore";

function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function isTooClose(posA: { x: number; y: number }, posB: { x: number; y: number }, minDist = 120) {
    const dx = posA.x - posB.x
    const dy = posA.y - posB.y
    return Math.sqrt(dx * dx + dy * dy) < minDist
}

function generateChildNodes(
    parent: Node,
    count: number,
    radius: number,
    angleSpread: number,
    existingNodes: Node[]
): Node[] {
    const angleStep = angleSpread / count
    const generated: Node[] = []

    for (let i = 0; i < count; i++) {
        let attempt = 0
        let x = 0, y = 0
        let valid = false

        while (!valid && attempt < 10) {
            const angleDeg = -angleSpread / 2 + angleStep * i + (Math.random() - 0.5) * 10
            const angle = (angleDeg * Math.PI) / 180
            const offset = radius + (Math.random() - 0.5) * 60

            x = parent.position.x + Math.cos(angle) * offset
            y = parent.position.y + Math.sin(angle) * offset

            valid = [...existingNodes, ...generated].every(
                (n) => !isTooClose(n.position, { x, y })
            )

            attempt++
        }

        generated.push({
            id: nanoid(),
            type: 'thought',
            position: { x, y },
            data: {
                title: '扩展想法',
                summary: '自动扩展节点',
                tags: ['自动'],
                highlight: false,
            },
        })
    }

    return generated
}

async function expandRecursively(
    parent: Node,
    depth: number,
    maxDepth: number,
    delay: number,
    minChildren: number,
    maxChildren: number,
    radius: number,
    angleSpread: number,
    autoArrange: boolean
) {
    if (depth >= maxDepth) return

    const {
        addNode,
        addEdge,
        growMode,
        isAutoExpanding,
        nodes: existingNodes,
    } = useGraphStore.getState()

    if (growMode === 'manual' || !isAutoExpanding) return

    const count = getRandomInt(minChildren, maxChildren)
    const children = generateChildNodes(parent, count, radius, angleSpread, existingNodes)

    for (const child of children) {
        addNode(child)
        addEdge({
            id: `${parent.id}-${child.id}`,
            source: parent.id,
            target: child.id,
            type: 'default',
        })

        await new Promise((res) => setTimeout(res, delay))
        await expandRecursively(
            child,
            depth + 1,
            maxDepth,
            delay,
            minChildren,
            maxChildren,
            radius * 0.9,
            angleSpread,
            autoArrange
        )
    }
}

export async function simulateAutoExpand(rootId: string) {
    const {
        growMode,
        nodes,
        setAutoExpanding,
        isAutoExpanding,
        config,
    } = useGraphStore.getState()

    if (growMode === 'manual' || isAutoExpanding) return

    const conf = config[growMode]
    const root = nodes.find((n) => n.id === rootId)
    if (!root) return

    setAutoExpanding(true)

    await expandRecursively(
        root,
        0,
        conf.maxDepth,
        conf.interval,
        conf.childrenRange[0],
        conf.childrenRange[1],
        conf.spreadRadius,
        conf.angleSpread,
        conf.autoArrange
    )

    setAutoExpanding(false)
}
