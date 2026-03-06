import { useSyncExternalStore } from 'react'

type ServiceConfigState = {
  gptService: string
  gptEndpoint: string
  gnnService: string
  gnnEndpoint: string
}

type ServiceConfigActions = {
  setGptService: (service: string) => void
  setGptEndpoint: (endpoint: string) => void
  setGnnService: (service: string) => void
  setGnnEndpoint: (endpoint: string) => void
}

const STORAGE_KEY = 'service-config'

const defaultState: ServiceConfigState = {
  gptService: 'default',
  gptEndpoint: '',
  gnnService: 'default',
  gnnEndpoint: '',
}

function loadFromStorage(): ServiceConfigState {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<ServiceConfigState>
    return { ...defaultState, ...parsed }
  } catch {
    return defaultState
  }
}

function saveToStorage(state: ServiceConfigState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        gptService: state.gptService,
        gptEndpoint: state.gptEndpoint,
        gnnService: state.gnnService,
        gnnEndpoint: state.gnnEndpoint,
      })
    )
  } catch {}
}

function createServiceConfigStore() {
  let state = loadFromStorage()
  const listeners = new Set<() => void>()

  const subscribe = (listener: () => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  const getSnapshot = () => state

  const setState = (partial: Partial<ServiceConfigState>) => {
    state = { ...state, ...partial }
    saveToStorage(state)
    listeners.forEach((l) => l())
  }

  const actions: ServiceConfigActions = {
    setGptService: (service) =>
      setState({
        gptService: service,
        gptEndpoint: service === 'default' ? '' : state.gptEndpoint,
      }),
    setGptEndpoint: (endpoint) => setState({ gptEndpoint: endpoint }),
    setGnnService: (service) =>
      setState({
        gnnService: service,
        gnnEndpoint: service === 'default' ? '' : state.gnnEndpoint,
      }),
    setGnnEndpoint: (endpoint) => setState({ gnnEndpoint: endpoint }),
  }

  return { subscribe, getSnapshot, getState: () => ({ ...state, ...actions }), setState, actions }
}

const serviceStore = createServiceConfigStore()

export function useServiceConfigStore() {
  const snapshot = useSyncExternalStore(serviceStore.subscribe, serviceStore.getSnapshot, serviceStore.getSnapshot)
  return { ...snapshot, ...serviceStore.actions }
}
