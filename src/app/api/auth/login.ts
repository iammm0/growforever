import api from '@/lib/axios'

export interface UserRegisterData {
    username: string
    email: string
    password: string
}

export interface UserLoginData {
    username: string
    password: string
}

export const registerUser = async (data: UserRegisterData) => {
    const response = await api.post('/users/register', data)
    return response.data
}

export const loginUser = async (data: UserLoginData) => {
    const response = await api.post('/users/login', data)
    const { access_token } = response.data

    // 保存 token
    localStorage.setItem('token', access_token)

    return response.data
}
