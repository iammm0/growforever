import { useSyncExternalStore } from 'react'
import { Node, Edge } from 'reactflow'
import type { GrowMode } from '@/types/grow-mode'

const initialRootNode: Node = {
  id: 'root',
  type: 'thought',
  position: { x: 300, y: 150 },
  draggable: false,
  data: {
    title: '种子',
    description: '一切从一个想法开始。',
    node_metadata: { tags: ['开心', '兴奋'] },
    highlight: true,
    role: 'seed',
    depth: 0,
    prompt: '',
    order: 0,
    magnified: false,
  },
}

export type AutoExpandConfig = {
  maxDepth: number
  childrenRange: [number, number]
  interval: number
  spreadRadius: number
  angleSpread: number
  autoArrange: boolean
}

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
  },
}

export interface GraphStoreState {
  nodes: Node[]
  edges: Edge[]
  growMode: GrowMode
  isAutoExpanding: boolean
  config: Record<GrowMode, AutoExpandConfig>
}

type GraphStoreActions = {
  setNodes: (updater: (nodes: Node[]) => Node[]) => void
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void
  addNode: (node: Node) => void
  addEdge: (edge: Edge) => void
  setGrowMode: (mode: GrowMode) => void
  setAutoExpanding: (v: boolean) => void
  reset: () => void
  setConfig: (mode: GrowMode, config: Partial<AutoExpandConfig>) => void
}

type GraphStore = GraphStoreState & GraphStoreActions

function createGraphStore() {
  let state: GraphStoreState = {
    nodes: [],
    edges: [],
    growMode: 'free',
    isAutoExpanding: false,
    config: defaultConfig,
  }

  const listeners = new Set<() => void>()

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const getSnapshot = () => state

  const setState = (partial: Partial<GraphStoreState>) => {
    state = { ...state, ...partial }
    listeners.forEach((l) => l())
  }

  const actions: GraphStoreActions = {
    setNodes: (updater) => setState({ nodes: updater(state.nodes) }),
    setEdges: (updater) => setState({ edges: updater(state.edges) }),
    addNode: (node) => setState({ nodes: [...state.nodes, node] }),
    addEdge: (edge) => setState({ edges: [...state.edges, edge] }),
    setGrowMode: (mode) => setState({ growMode: mode }),
    setAutoExpanding: (v) => setState({ isAutoExpanding: v }),
    reset: () =>
      setState({
        nodes: [initialRootNode],
        edges: [],
        growMode: 'manual',
        isAutoExpanding: false,
      }),
    setConfig: (mode, newConfig) =>
      setState({
        config: {
          ...state.config,
          [mode]: { ...state.config[mode], ...newConfig },
        },
      }),
  }

  const getState = (): GraphStore => ({ ...state, ...actions })

  return { subscribe, getSnapshot, getState, setState, actions }
}

const graphStore = createGraphStore()

export function useGraphStore(): GraphStore
export function useGraphStore<T>(selector: (s: GraphStore) => T): T
export function useGraphStore<T>(selector?: (s: GraphStore) => T): GraphStore | T {
  const snapshot = useSyncExternalStore(graphStore.subscribe, graphStore.getSnapshot, graphStore.getSnapshot)
  const fullState = { ...snapshot, ...graphStore.actions } as GraphStore
  if (selector) {
    return selector(fullState)
  }
  return fullState
}

export const getGraphStoreState = graphStore.getState
