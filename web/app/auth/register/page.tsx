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
import { UserPlus, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { actualMode } = useTheme()
  const { register } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/20' : 'border-black/15'
  const bgColor = isDark ? 'bg-black/60' : 'bg-white/15'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    if (password.length < 6) {
      setError('密码长度至少为 6 位')
      return
    }
    setLoading(true)
    try {
      await register(email, password, username)
      router.push('/profile')
    } catch (err: any) {
      setError(err.message || '注册失败')
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
              <UserPlus className="h-8 w-8" />
            </div>
            <h1 className={`mb-2 text-2xl font-bold ${textColor}`}>注册</h1>
            <p className={`text-sm opacity-80 ${textColor}`}>加入 GrowForever，开始你的思维之旅</p>
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
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>用户名</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" minLength={3} maxLength={30} className={`border ${borderColor} bg-transparent ${textColor}`} />
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>密码</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" className={`border ${borderColor} bg-transparent ${textColor}`} />
              <p className={`mt-1 text-xs opacity-60 ${textColor}`}>密码长度至少为 6 位</p>
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>确认密码</label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" className={`border ${borderColor} bg-transparent ${textColor}`} />
            </div>
            <Button type="submit" variant="grow" disabled={loading} className="w-full py-4 font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '注册'}
            </Button>
            <p className="text-center">
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                已有账号？立即登录
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
