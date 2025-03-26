import { create } from 'zustand'
import {GraphState} from "@/models/GraphState";
import {GraphNode} from "@/models/GraphNode";
import {GraphEdge} from "@/models/GraphEdge";

interface GraphStore extends GraphState {
    setNodes: (nodes: GraphNode[]) => void
    setEdges: (edges: GraphEdge[]) => void
    addNode: (node: GraphNode) => void
    addEdge: (edge: GraphEdge) => void
    updateNode: (id: string, data: Partial<GraphNode['data']>) => void
    reset: () => void
}

export const useGraphStore = create<GraphStore>((set) => ({
    nodes: [],
    edges: [],
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),
    addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
    addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    updateNode: (id, data) =>
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, ...data } } : node
            ),
        })),
    reset: () => set({ nodes: [], edges: [] }),
}))
