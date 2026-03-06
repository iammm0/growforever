'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import GlobalBackground from '@/components/presentation/global-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert } from '@/components/ui/alert'
import { Camera, Edit, Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { actualMode } = useTheme()
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [twitter, setTwitter] = useState('')
  const [instagram, setInstagram] = useState('')
  const [github, setGithub] = useState('')
  const [avatar, setAvatar] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/10' : 'border-black/10'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      setUsername(user.username)
      setBio(user.bio || '')
      setDisplayName(user.publicInfo?.displayName || '')
      setLocation(user.publicInfo?.location || '')
      setWebsite(user.publicInfo?.website || '')
      setTwitter(user.publicInfo?.socialLinks?.twitter || '')
      setInstagram(user.publicInfo?.socialLinks?.instagram || '')
      setGithub(user.publicInfo?.socialLinks?.github || '')
      setAvatar(user.avatar || '')
    }
  }, [user, authLoading, router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/user/avatar', { method: 'POST', body: formData, credentials: 'include' })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || '上传失败')
      }
      const data = await response.json()
      setAvatar(data.avatar)
      await refreshUser()
      setSuccess('头像更新成功')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || '上传头像失败')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          bio,
          publicInfo: { displayName, location, website, socialLinks: { twitter, instagram, github } },
        }),
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || '更新失败')
      }
      await refreshUser()
      setSuccess('资料更新成功')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || '更新资料失败')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  if (!user) return null

  return (
    <div className="relative min-h-screen">
      <GlobalBackground mobilePosDark="center" mobilePosLight="center" desktopPosDark="center" desktopPosLight="center" mobileZoom={1.0} overlay={true} />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-2xl font-bold text-transparent">个人资料</h1>
        <p className={`mb-6 text-sm opacity-80 ${textColor}`}>管理你的个人信息和公开资料</p>
        {error && <Alert variant="destructive" className="mb-4 rounded-xl">{error}</Alert>}
        {success && <Alert variant="success" className="mb-4 rounded-xl">{success}</Alert>}
        <div className={`rounded-2xl border p-6 backdrop-blur-xl sm:p-8 ${borderColor} ${isDark ? 'bg-black/60' : 'bg-white/90'}`}>
          <div className="relative mb-8 text-center">
            <div className="relative mx-auto inline-block">
              <div className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 shadow-lg sm:h-32 sm:w-32`}>
                {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-2xl font-bold">{username.charAt(0).toUpperCase()}</span>}
              </div>
              <label className="absolute bottom-2 right-1/2 flex h-10 w-10 translate-x-12 cursor-pointer items-center justify-center rounded-full bg-primary text-white transition-all hover:scale-110 disabled:cursor-not-allowed" htmlFor="avatar-upload">
                <Camera className="h-5 w-5" />
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} className="hidden" />
            </div>
          </div>
          <div className={`my-6 h-px ${borderColor}`} />
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className={`mb-4 flex items-center gap-2 font-semibold ${textColor}`}><Edit className="h-5 w-5" />基本信息</h2>
              <div className="space-y-4">
                <div>
                  <label className={`mb-2 block text-sm font-medium ${textColor}`}>用户名</label>
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} required className={`border ${borderColor} bg-transparent`} />
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${textColor}`}>个人简介</label>
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={500} className={`border ${borderColor} bg-transparent`} />
                  <p className={`mt-1 text-xs opacity-60 ${textColor}`}>最多 500 字</p>
                </div>
              </div>
            </div>
            <div className={`my-6 h-px ${borderColor}`} />
            <div>
              <h2 className={`mb-4 font-semibold ${textColor}`}>公开信息</h2>
              <div className="space-y-4">
                <div>
                  <label className={`mb-2 block text-sm font-medium ${textColor}`}>显示名称</label>
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`border ${borderColor} bg-transparent`} />
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${textColor}`}>所在地</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} className={`border ${borderColor} bg-transparent`} />
                </div>
                <div>
                  <label className={`mb-2 block text-sm font-medium ${textColor}`}>个人网站</label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={`border ${borderColor} bg-transparent`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${textColor}`}>Twitter</label>
                    <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@username" className={`border ${borderColor} bg-transparent`} />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${textColor}`}>Instagram</label>
                    <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" className={`border ${borderColor} bg-transparent`} />
                  </div>
                  <div>
                    <label className={`mb-2 block text-sm font-medium ${textColor}`}>GitHub</label>
                    <Input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="username" className={`border ${borderColor} bg-transparent`} />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" variant="grow" disabled={loading} className="mt-6 w-full py-4 font-semibold">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '保存更改'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
