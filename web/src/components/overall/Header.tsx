'use client'

import React, { useState } from 'react'
import styles from '../../styles/Header.module.css'
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Tooltip, useMediaQuery } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import { useRouter } from 'next/navigation'
import ThemeToggleButton from '@/src/components/app/ThemeToggleButton'

const Header: React.FC = () => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(anchorEl)

  const isMobile = useMediaQuery('(max-width:768px)')

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => setAnchorEl(null)

  const handleNavigate = (path: string) => {
    router.push(path)
    handleMenuClose()
  }

  const handleGitHubClick = () => {
    window.open('https://github.com/iammm0/growforever', '_blank', 'noopener,noreferrer')
  }

  return (
    <AppBar
      position="sticky"
      className={styles.header}
      elevation={0}
      /* 防止 MUI 默认 padding 影响小屏视觉高度 */
      color="transparent"
    >
      <Toolbar className={styles.toolbar} disableGutters>
        {/* 左侧：GitHub */}
        <div className={styles.leftButtons}>
          <Tooltip title="与我一起协作开发该项目！" arrow placement="bottom">
            <IconButton
              className={styles.iconButton}
              aria-label="Open GitHub repository"
              onClick={handleGitHubClick}
              size={isMobile ? 'small' : 'medium'}
            >
              <GitHubIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>
        </div>

        {/* 右侧：主题切换 + 更多（可按需启用） */}
        <div className={styles.rightButtons}>
          <ThemeToggleButton />

          {/* 如需更多菜单，去掉注释即可 */}
          {/* <Tooltip title="更多内容" arrow placement="bottom">
            <IconButton
              onClick={handleMenuOpen}
              className={styles.moreIcon}
              aria-label="Open more menu"
              size={isMobile ? 'small' : 'medium'}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip> */}
        </div>
      </Toolbar>

      {/* 下拉菜单（启用时） */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        classes={{ paper: styles.dropdownMenu as any }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
      >
        <MenuItem onClick={() => handleNavigate('/artist-profile')} className={styles.menuItem}>
          艺术家主页
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/artist-model')} className={styles.menuItem}>
          模型同人作品
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/artist-work')} className={styles.menuItem}>
          其他作品集
        </MenuItem>
      </Menu>
    </AppBar>
  )
}

export default Header