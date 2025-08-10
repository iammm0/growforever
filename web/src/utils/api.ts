import axios from 'axios';
import { LoginRequest, Token } from '../types/Auth';
import { TextGenRequest, TextGenResponse } from '../types/Text';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000',
});

export const login = (data: LoginRequest) =>
  api.post<Token>('/auth/token', new URLSearchParams(data));

export const generateText = (data: TextGenRequest) =>
  api.post<TextGenResponse>('/text/generate', data);

export default api;
