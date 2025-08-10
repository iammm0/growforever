'use client';
import { useState } from 'react';
import { login } from '../utils/api';
import type { LoginRequest, Token } from '../types/Auth';

export function useAuth() {
  const [token, setToken] = useState<Token | null>(null);

  const handleLogin = async (data: LoginRequest) => {
    const res = await login(data);
    setToken(res.data);
    return res.data;
  };

  return { token, login: handleLogin };
}
