'use client'
import { Button, Stack, IconButton, Box, FormControl, InputLabel, Select, MenuItem, TextField, FormHelperText, Typography, Badge, alpha, useTheme } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import { useMediaQuery } from '@mui/system'
import { MenuIcon, SettingsIcon, ChevronLeft, ChevronRight, X, Trash2, MessageSquare, Cog } from 'lucide-react'
import { useGraphStore } from '@/core/store/graph-store'
import { useServiceConfigStore } from '@/core/store/service-store'

interface ControlPanelProps {
  onPromptOpen?: () => void
  onConfigOpen?: () => void
}

export default function ControlPanel({ onPromptOpen, onConfigOpen }: ControlPanelProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isDark = theme.palette.mode === 'dark'
  const [expanded, setExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const { reset, growMode } = useGraphStore()
  const { gptService, gptEndpoint, gnnService, gnnEndpoint, setGptService, setGptEndpoint, setGnnService, setGnnEndpoint } = useServiceConfigStore()

  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)
  const bgColor = isDark ? alpha('#000', 0.6) : alpha('#fff', 0.15)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y

        const maxX = window.innerWidth - (expanded ? 320 : 60)
        const maxY = window.innerHeight - 60

        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY)),
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragStart, expanded])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault()
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  if (!isVisible) {
    return (
      <Box
        component="button"
        onClick={() => setIsVisible(true)}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 60,
          width: 52,
          height: 52,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
          '&:hover': {
            transform: 'scale(1.05) translateY(-2px)',
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.5)}`,
          },
        }}
      >
        <MenuIcon size={20} />
      </Box>
    )
  }

  return (
    <Box
      ref={panelRef}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 50,
        width: expanded ? 320 : 64,
        minHeight: expanded ? 200 : 120,
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        background: bgColor,
        backdropFilter: 'blur(20px)',
        boxShadow: isDark
          ? `0 8px 32px ${alpha('#000', 0.4)}`
          : `0 8px 32px ${alpha('#000', 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        overflow: 'hidden',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 拖拽句柄 */}
      <Box
        data-drag-handle
        sx={{
          cursor: 'grab',
          userSelect: 'none',
          p: expanded ? 1.5 : 1,
          borderBottom: `1px solid ${borderColor}`,
          background: alpha(theme.palette.primary.main, 0.05),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        {expanded && (
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            控制面板
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              color: textColor,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setIsVisible(false)}
            sx={{
              color: textColor,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* 面板内容 */}
      <Box
        sx={{
          p: expanded ? 2 : 1,
          transition: 'all 0.3s ease',
        }}
      >
        {expanded ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, color: textColor, opacity: 0.8 }}>
                GPT 服务
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={gptService}
                  onChange={(e) => setGptService(e.target.value)}
                  sx={{
                    bgcolor: 'transparent',
                    color: textColor,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: borderColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem value="default">默认</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, color: textColor, opacity: 0.8 }}>
                GNN 服务
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={gnnService}
                  onChange={(e) => setGnnService(e.target.value)}
                  sx={{
                    bgcolor: 'transparent',
                    color: textColor,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: borderColor,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem value="default">默认</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ height: 1, bgcolor: borderColor, my: 1.5 }} />

            <Stack spacing={1}>
              <Button
                onClick={onPromptOpen}
                startIcon={<MessageSquare size={16} />}
                sx={{
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                打开提示词
              </Button>
              <Button
                onClick={reset}
                startIcon={<Trash2 size={16} />}
                sx={{
                  color: theme.palette.error.main,
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
                  bgcolor: alpha(theme.palette.error.main, 0.05),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.error.main, 0.15),
                    borderColor: theme.palette.error.main,
                  },
                }}
              >
                清空画布
              </Button>
            </Stack>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                color: textColor,
                opacity: 0.6,
              }}
            >
              按 Ctrl+B 隐藏面板
            </Typography>
          </>
        ) : (
          <Stack spacing={0.5} alignItems="center">
            <IconButton
              size="small"
              onClick={onPromptOpen}
              sx={{
                color: textColor,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <MessageSquare size={20} />
            </IconButton>
            <IconButton
              size="small"
              onClick={reset}
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <Trash2 size={20} />
            </IconButton>
          </Stack>
        )}
      </Box>
    </Box>
  )
}
