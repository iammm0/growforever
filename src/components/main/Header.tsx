'use client';

import React, { useState } from 'react';
import styles from '../../styles/Header.module.css';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRouter } from 'next/navigation';

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
        window.open('https://github.com/growforever-main.git', '_blank');
    };

    return (
        <AppBar position="sticky" className={styles.header} elevation={0}>
            <Toolbar className={styles.toolbar}>
                {/* 左侧：菜单按钮 + GitHub */}
                <div className={styles.leftButtons}>
                    <IconButton
                        className={styles.iconButton}
                        aria-label="GitHub"
                        onClick={handleGitHubClick}
                    >
                        <GitHubIcon />
                    </IconButton>
                </div>

                {/* 右侧：文字下拉菜单 */}
                <div className={styles.rightButtons}>
                    <Button
                        className={styles.menuButton}
                        onClick={handleMenuOpen}
                        endIcon={<ArrowDropDownIcon />}
                    >
                        关于艺术家 3rd
                    </Button>

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
