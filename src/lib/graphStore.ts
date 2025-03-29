import { create } from 'zustand'
import { Node, Edge } from 'reactflow'
import {GrowMode} from "@/types/GrowthNode";

const initialRootNode: Node = {
    id: 'root',
    type: 'thought',
    position: { x: 300, y: 150 },
    data: {
        title: '🌱 永恒之森 - 种子',
        summary: '一切从一个想法开始。',
        tags: ['AI', '思维链'],
        highlight: true,
        role: 'seed',
    },
}

// 👇 示例初始配置
const defaultConfig: Record<GrowMode, AutoExpandConfig> = {
    free: {
        maxDepth: 4,
        childrenRange: [1, 2],
        interval: 800,
        spreadRadius: 500,
        angleSpread: 180,
        autoArrange: true,
    },
    fury: {
        maxDepth: 6,
        childrenRange: [2, 4],
        interval: 200,
        spreadRadius: 500,
        angleSpread: 300,
        autoArrange: true,
    },
    manual: {
        maxDepth: 0,
        childrenRange: [0, 0],
        interval: 0,
        spreadRadius: 0,
        angleSpread: 0,
        autoArrange: false,
    }
}

type AutoExpandConfig = {
    maxDepth: number
    childrenRange: [number, number]
    interval: number
    spreadRadius: number
    angleSpread: number
    autoArrange: boolean
}

interface GraphStore {
    nodes: Node[]
    edges: Edge[]
    growMode: GrowMode
    isAutoExpanding: boolean

    setNodes: (updater: (nodes: Node[]) => Node[]) => void
    setEdges: (updater: (edges: Edge[]) => Edge[]) => void
    addNode: (node: Node) => void
    addEdge: (edge: Edge) => void
    setGrowMode: (mode: GrowMode) => void
    setAutoExpanding: (v: boolean) => void
    reset: () => void

    config: Record<GrowMode, AutoExpandConfig>
    setConfig: (mode: GrowMode, config: Partial<AutoExpandConfig>) => void
}

export const useGraphStore = create<GraphStore>((set) => ({
    nodes: [],
    edges: [],
    growMode: 'free',
    isAutoExpanding: false,

    setNodes: (updater) => set((state) => ({ nodes: updater(state.nodes) })),
    setEdges: (updater) => set((state) => ({ edges: updater(state.edges) })),
    addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    setGrowMode: (mode:GrowMode) => set({ growMode: mode }),
    setAutoExpanding: (v) => set({ isAutoExpanding: v }),
    reset: () => set({
        nodes: [initialRootNode],
        edges: [],
        growMode: 'manual',
        isAutoExpanding: false,
    }),

    config: defaultConfig,
    setConfig: (mode, newConfig) => set((state) => ({
        config: {
            ...state.config,
            [mode]: {
                ...state.config[mode],
                ...newConfig,
            },
        },
    })),
}))