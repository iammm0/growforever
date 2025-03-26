import { GraphNode } from "@/models/GraphNode"
import {GraphEdge} from "@/models/GraphEdge";
import { create } from 'zustand'

interface GraphStore {
    nodes: GraphNode[]
    edges: GraphEdge[]
    setNodes: (nodes: GraphNode[]) => void
    setEdges: (edges: GraphEdge[]) => void
    addNode: (...nodes: GraphNode[]) => void
    addEdge: (...edges: GraphEdge[]) => void
    reset: () => void
}

export const useGraphStore = create<GraphStore>((set) => ({
    nodes: [],
    edges: [],
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    addNode: (...nodes) => set((state) => ({ nodes: [...state.nodes, ...nodes] })),
    addEdge: (...edges) => set((state) => ({ edges: [...state.edges, ...edges] })),
    reset: () => set({ nodes: [], edges: [] }),
}))
