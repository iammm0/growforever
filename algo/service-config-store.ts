import {create} from 'zustand'
import {persist, createJSONStorage} from 'zustand/middleware'

type ServiceConfigState = {
    gptService: string
    gptEndpoint: string
    gnnService: string
    gnnEndpoint: string
    setGptService: (service: string) => void
    setGptEndpoint: (endpoint: string) => void
    setGnnService: (service: string) => void
    setGnnEndpoint: (endpoint: string) => void
}

const defaultState = {
    gptService: 'default',
    gptEndpoint: '',
    gnnService: 'default',
    gnnEndpoint: '',
}

export const useServiceConfigStore = create<ServiceConfigState>()(
    persist(
        (set) => ({
            ...defaultState,
            setGptService: (service) => set((state) => ({
                gptService: service,
                // 当切换服务选项时保留已配置的地址，除非改为默认
                gptEndpoint: service === 'default' ? '' : state.gptEndpoint,
            })),
            setGptEndpoint: (endpoint) => set(() => ({ gptEndpoint: endpoint })),
            setGnnService: (service) => set((state) => ({
                gnnService: service,
                gnnEndpoint: service === 'default' ? '' : state.gnnEndpoint,
            })),
            setGnnEndpoint: (endpoint) => set(() => ({ gnnEndpoint: endpoint })),
        }),
        {
            name: 'service-config',
            storage: typeof window === 'undefined'
                ? undefined
                : createJSONStorage(() => localStorage),
            partialize: (state) => ({
                gptService: state.gptService,
                gptEndpoint: state.gptEndpoint,
                gnnService: state.gnnService,
                gnnEndpoint: state.gnnEndpoint,
            }),
        },
    ),
)
