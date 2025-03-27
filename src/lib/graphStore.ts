import { create } from 'zustand'
import { Node, Edge } from 'reactflow'

interface GraphStore {
    nodes: Node[]
    edges: Edge[]
    setNodes: (updater: (nodes: Node[]) => Node[]) => void
    setEdges: (updater: (edges: Edge[]) => Edge[]) => void
    addNode: (node: Node) => void
    addEdge: (edge: Edge) => void
    reset: () => void
}

export const useGraphStore = create<GraphStore>((set) => ({
    nodes: [],
    edges: [],
    setNodes: (updater) => set((state) => ({ nodes: updater(state.nodes) })),
    setEdges: (updater) => set((state) => ({ edges: updater(state.edges) })),
    addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    reset: () => set({ nodes: [], edges: [] }),
}))

