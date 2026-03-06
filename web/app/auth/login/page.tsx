'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import GlobalBackground from '@/components/presentation/global-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert } from '@/components/ui/alert'
import { LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { actualMode } = useTheme()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/20' : 'border-black/15'
  const bgColor = isDark ? 'bg-black/60' : 'bg-white/15'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/profile')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      <GlobalBackground mobilePosDark="center" mobilePosLight="center" desktopPosDark="center" desktopPosLight="center" mobileZoom={1.0} overlay={true} />
      <div className="relative z-10 mx-auto w-full max-w-sm px-4 py-8">
        <div className={`w-full rounded-2xl border p-6 shadow-2xl backdrop-blur-xl sm:p-8 ${borderColor} ${bgColor}`}>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-white">
              <LogIn className="h-8 w-8" />
            </div>
            <h1 className={`mb-2 text-2xl font-bold ${textColor}`}>登录</h1>
            <p className={`text-sm opacity-80 ${textColor}`}>欢迎回到 GrowForever</p>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 rounded-xl">
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>邮箱</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={`border ${borderColor} bg-transparent ${textColor}`} />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>密码</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={`border ${borderColor} bg-transparent ${textColor}`} />
            </div>
            <Button type="submit" variant="grow" disabled={loading} className="w-full py-4 font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '登录'}
            </Button>
            <p className="text-center">
              <Link href="/auth/register" className="font-medium text-primary hover:underline">
                还没有账号？立即注册
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
