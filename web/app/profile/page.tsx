'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  alpha,
  useTheme,
  IconButton,
} from '@mui/material'
import { PhotoCamera, Edit } from '@mui/icons-material'

export default function ProfilePage() {
  const router = useRouter()
  const theme = useTheme()
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
  const isDark = theme.palette.mode === 'dark'

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

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          bio,
          publicInfo: {
            displayName,
            location,
            website,
            socialLinks: {
              twitter,
              instagram,
              github,
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新失败')
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
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!user) {
    return null
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 4 }, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #22c55e 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          个人资料
        </Typography>
        <Typography variant="body2" color="text.secondary">
          管理你的个人信息和公开资料
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
          }}
        >
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          background: isDark
            ? alpha(theme.palette.background.paper, 0.8)
            : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* 头像区域 */}
        <Box
          sx={{
            mb: 4,
            textAlign: 'center',
            position: 'relative',
            display: 'inline-block',
            width: '100%',
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <Avatar
              src={avatar}
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                mx: 'auto',
                mb: 2,
                border: `4px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
            />
            <label htmlFor="avatar-upload">
              <IconButton
                component="span"
                disabled={uploadingAvatar}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 'calc(50% - 60px)',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Edit sx={{ fontSize: 20 }} />
              基本信息
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <TextField
                fullWidth
                label="个人简介"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                multiline
                rows={4}
                helperText="最多 500 字"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              公开信息
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="显示名称"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              <TextField
                fullWidth
                label="所在地"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              <TextField
                fullWidth
                label="个人网站"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  sx={{
                    flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  label="Twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username"
                />
                <TextField
                  fullWidth
                  sx={{
                    flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  label="Instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username"
                />
                <TextField
                  fullWidth
                  sx={{
                    flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  label="GitHub"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="username"
                />
              </Box>
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : '保存更改'}
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
