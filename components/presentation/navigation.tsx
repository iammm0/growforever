'use client'

import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Avatar,
  Box,
  alpha,
  useTheme,
  Divider,
} from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LogoutIcon from '@mui/icons-material/Logout'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import ThemeToggle from './theme-toggle'

const Navigation: React.FC = () => {
  const router = useRouter()
  const theme = useTheme()
  const { user, logout } = useAuth()
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null)
  const [authMenuAnchor, setAuthMenuAnchor] = useState<null | HTMLElement>(null)
  const userMenuOpen = Boolean(userMenuAnchor)
  const authMenuOpen = Boolean(authMenuAnchor)
  const isMobile = useMediaQuery('(max-width:768px)')
  const isDark = theme.palette.mode === 'dark'

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget)
  }

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null)
  }

  const handleAuthMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAuthMenuAnchor(event.currentTarget)
  }

  const handleAuthMenuClose = () => {
    setAuthMenuAnchor(null)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
    handleUserMenuClose()
    handleAuthMenuClose()
  }

  const handleGitHubClick = () => {
    window.open('https://github.com/iammm0/growforever-web.git', '_blank', 'noopener,noreferrer')
  }

  const handleLogout = async () => {
    await logout()
    handleUserMenuClose()
    router.push('/')
  }

  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.15)
  const hoverBgColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'transparent',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${borderColor}`,
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1,
          minHeight: { xs: 56, sm: 64 },
          justifyContent: 'space-between',
        }}
      >
        {/* 左侧：Logo 和 GitHub */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="与我一起协作开发该项目！" arrow placement="bottom">
            <IconButton
              onClick={handleGitHubClick}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                color: textColor,
                '&:hover': {
                  backgroundColor: hoverBgColor,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <GitHubIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* 右侧：主题切换 + 认证 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* 主题切换按钮 */}
          <ThemeToggle />

          {/* 认证按钮 */}
          {user ? (
            <>
              <Tooltip title="用户菜单" arrow placement="bottom">
                <IconButton
                  onClick={handleUserMenuOpen}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{
                      width: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      border: `2px solid ${isDark ? alpha('#fff', 0.3) : alpha('#000', 0.2)}`,
                      '&:hover': {
                        borderColor: textColor,
                      },
                      transition: 'border-color 0.2s ease',
                    }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={userMenuAnchor}
                open={userMenuOpen}
                onClose={handleUserMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backgroundColor: isDark
                      ? alpha('#000', 0.8)
                      : alpha('#fff', 0.9),
                    backdropFilter: 'blur(20px)',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <AccountCircleIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  个人资料
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  登出
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Tooltip title="登录/注册" arrow placement="bottom">
                <IconButton
                  onClick={handleAuthMenuOpen}
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    color: textColor,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      borderColor: theme.palette.primary.main,
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <AccountCircleIcon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={authMenuAnchor}
                open={authMenuOpen}
                onClose={handleAuthMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 2,
                    border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backgroundColor: isDark
                      ? alpha('#000', 0.8)
                      : alpha('#fff', 0.9),
                    backdropFilter: 'blur(20px)',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                      borderRadius: 1,
                      mx: 1,
                      my: 0.5,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    },
                  },
                }}
              >
                <MenuItem onClick={() => handleNavigate('/auth/login')}>
                  <LoginIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  登录
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/auth/register')}>
                  <PersonAddIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  注册
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navigation
