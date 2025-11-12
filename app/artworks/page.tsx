'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Avatar,
  alpha,
  useTheme,
  Alert,
  Fab,
} from '@mui/material'
import { Add, Edit, Delete, CloudUpload, Person, Home } from '@mui/icons-material'
import { motion } from 'framer-motion'
import GlobalBackground from '@/components/presentation/global-background'

interface Artwork {
  id: string
  title: string
  description?: string
  imageUrl: string
  artist: {
    id: string
    username: string
    avatar?: string
  }
  tags?: string[]
  isPublic: boolean
  createdAt: string
}

export default function ArtworksPage() {
  const router = useRouter()
  const theme = useTheme()
  const { user } = useAuth()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tags: '',
    isPublic: true,
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const isDark = theme.palette.mode === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)
  const bgColor = isDark ? alpha('#000', 0.6) : alpha('#fff', 0.15)

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      const response = await fetch('/api/artworks')
      if (response.ok) {
        const data = await response.json()
        setArtworks(data.artworks || [])
      }
    } catch (error) {
      console.error('加载作品失败:', error)
      setError('加载作品失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (artwork?: Artwork) => {
    if (artwork) {
      setEditingArtwork(artwork)
      setFormData({
        title: artwork.title,
        description: artwork.description || '',
        imageUrl: artwork.imageUrl,
        tags: artwork.tags?.join(', ') || '',
        isPublic: artwork.isPublic,
      })
    } else {
      setEditingArtwork(null)
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        tags: '',
        isPublic: true,
      })
    }
    setDialogOpen(true)
    setError('')
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingArtwork(null)
    setError('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/artworks/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '上传失败')
      }

      const data = await response.json()
      setFormData({ ...formData, imageUrl: data.imageUrl })
    } catch (error: any) {
      setError(error.message || '上传图片失败')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.imageUrl) {
      setError('请填写标题和上传图片')
      return
    }

    setError('')
    try {
      const tags = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)

      const url = editingArtwork
        ? `/api/artworks/${editingArtwork.id}`
        : '/api/artworks'
      const method = editingArtwork ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '保存失败')
      }

      handleCloseDialog()
      loadArtworks()
    } catch (error: any) {
      setError(error.message || '保存失败，请稍后重试')
    }
  }

  const handleDelete = async (artworkId: string) => {
    if (!confirm('确定要删除这个作品吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/artworks/${artworkId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('删除失败')
      }

      loadArtworks()
    } catch (error) {
      console.error('删除作品失败:', error)
      setError('删除失败，请稍后重试')
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GlobalBackground />
        <CircularProgress sx={{ position: 'relative', zIndex: 1 }} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        zIndex: 1,
      }}
    >
      {/* 全局背景 */}
      <GlobalBackground
        mobilePosDark="center"
        mobilePosLight="center"
        desktopPosDark="center"
        desktopPosLight="center"
        mobileZoom={1.0}
        overlay={true}
      />

      {/* 快捷返回主页按钮 */}
      <Fab
        color="primary"
        aria-label="返回主页"
        onClick={() => router.push('/')}
        sx={{
          position: 'fixed',
          bottom: { xs: 24, sm: 32 },
          right: { xs: 24, sm: 32 },
          zIndex: 1000,
          bgcolor: alpha(theme.palette.primary.main, 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha('#fff', 0.2)}`,
          '&:hover': {
            bgcolor: theme.palette.primary.main,
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Home />
      </Fab>

      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: 4, position: 'relative', zIndex: 1 }}>
        {/* 标题和操作栏 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 4,
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              艺术家作品展示
            </Typography>
            <Typography variant="body2" sx={{ color: textColor, opacity: 0.8 }}>
              发现和分享精彩的艺术作品
            </Typography>
          </Box>
          {user && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              上传作品
            </Button>
          )}
        </Box>

        {error && !dialogOpen && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* 作品网格 */}
        <Grid container spacing={3}>
          {artworks.map((artwork, index) => (
            <Grid item xs={12} sm={6} md={4} key={artwork.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isDark
                        ? '0 12px 40px rgba(0, 0, 0, 0.4)'
                        : '0 12px 40px rgba(0, 0, 0, 0.15)',
                      borderColor: theme.palette.secondary.main,
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="300"
                    image={artwork.imageUrl}
                    alt={artwork.title}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                      },
                    }}
                  />
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: textColor,
                      }}
                    >
                      {artwork.title}
                    </Typography>
                    {artwork.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: alpha(textColor, 0.9),
                        }}
                      >
                        {artwork.description}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <Avatar
                        src={artwork.artist.avatar}
                        sx={{ width: 24, height: 24 }}
                      >
                        <Person sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="caption" sx={{ color: alpha(textColor, 0.8) }}>
                        {artwork.artist.username}
                      </Typography>
                    </Box>
                    {artwork.tags && artwork.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {artwork.tags.slice(0, 3).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: 'secondary.main',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                    {user && user.id === artwork.artist.id && (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          mt: 'auto',
                          pt: 2,
                          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(artwork)}
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(artwork.id)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {artworks.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 12,
              borderRadius: 3,
              border: `2px dashed ${borderColor}`,
            }}
          >
            <Typography variant="h6" sx={{ color: textColor, mb: 1 }} gutterBottom>
              暂无作品
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(textColor, 0.8), mb: 3 }}>
              成为第一个分享作品的艺术家吧！
            </Typography>
            {user && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: 2,
                  px: 4,
                }}
              >
                上传作品
              </Button>
            )}
          </Box>
        )}

        {/* 上传/编辑对话框 */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              border: `1px solid ${borderColor}`,
              background: bgColor,
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              color: textColor,
            }}
          >
            {editingArtwork ? '编辑作品' : '上传新作品'}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="标题"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: borderColor,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="描述"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={4}
              margin="normal"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: borderColor,
                  },
                },
              }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={uploading}
                  fullWidth
                  startIcon={<CloudUpload />}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: borderColor,
                    color: textColor,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {uploading ? '上传中...' : '选择图片'}
                </Button>
              </label>
              {formData.imageUrl && (
                <Box
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  }}
                >
                  <img
                    src={formData.imageUrl}
                    alt="预览"
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              )}
            </Box>
            <TextField
              fullWidth
              label="标签（用逗号分隔）"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              margin="normal"
              placeholder="例如: 绘画, 数字艺术, 抽象"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: borderColor,
                  },
                },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                />
              }
              label="公开显示"
              sx={{ mt: 2, color: textColor }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button
              onClick={handleCloseDialog}
              sx={{
                borderRadius: 2,
                px: 3,
                color: textColor,
              }}
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
            >
              保存
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
