import { create } from 'zustand'
import { Node, Edge } from 'reactflow'
import {GrowMode} from "@/types/GrowthNode";

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
    reset: () => set({ nodes: [], edges: [], isAutoExpanding: false }),
}))
