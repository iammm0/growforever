import axios from 'web/src/lib/axios'

const api = axios.create({
    baseURL: 'http://localhost:8000', // 根据你的后端地址调整
})

// 自动附加 Bearer token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

export default api

