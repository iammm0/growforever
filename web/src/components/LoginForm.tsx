'use client';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm m-auto">
      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
        className="border p-2"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2"
      />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
    </form>
  );
}
