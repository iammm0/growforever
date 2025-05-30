'use client';

import React, { useState } from 'react';
import styles from '../../styles/Header.module.css';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useRouter } from 'next/navigation';
import ThemeToggleButton from "@/components/app/ThemeToggleButton";
import MoreVertIcon from '@mui/icons-material/MoreVert';

const Header: React.FC = () => {
    const router = useRouter();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigate = (path: string) => {
        router.push(path);
        handleMenuClose();
    };

    const handleGitHubClick = () => {
        window.open('https://github.com/iammm0/growforever-main.git', '_blank');
    };

    return (
        <AppBar position="sticky" className={styles.header} elevation={0}>

            <Toolbar className={styles.toolbar}>
                {/* 左侧：菜单按钮 + GitHub */}
                <div className={styles.leftButtons}>
                    <Tooltip title="与我一起协作开发该项目！" arrow placement="bottom">
                        <IconButton
                            className={styles.iconButton}
                            aria-label="GitHub"
                            onClick={handleGitHubClick}
                        >
                            <GitHubIcon fontSize="medium" />
                        </IconButton>
                    </Tooltip>
                </div>

                {/* 右侧：文字下拉菜单 */}
                <div className={styles.rightButtons}>
                    <Tooltip title="更多内容" arrow placement="bottom">
                        <IconButton
                            onClick={handleMenuOpen}
                            className={styles.iconButton}
                            size="large"
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Tooltip>
                    {/* 切换主题按钮 */}
                    <ThemeToggleButton />
                    <Menu
                        anchorEl={anchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                        classes={{ paper: styles.dropdownMenu }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
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
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
