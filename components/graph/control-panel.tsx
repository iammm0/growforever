'use client'
import { Button, Stack, IconButton, Box, FormControl, InputLabel, Select, MenuItem, TextField, FormHelperText, Typography, Badge } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useMediaQuery, useTheme } from "@mui/system";
import { MenuIcon, SettingsIcon, ChevronLeft, ChevronRight, X, Trash2, MessageSquare, Cog } from "lucide-react";
import { useGraphStore } from "@/core/store/graph-store";
import { useServiceConfigStore } from "@/core/store/service-store";
import { cn } from '@/lib/utils';
import styles from '@/styles/floating-control-panel.module.css';

interface ControlPanelProps {
  onPromptOpen?: () => void
  onConfigOpen?: () => void
}

export default function ControlPanel({ onPromptOpen, onConfigOpen }: ControlPanelProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [expanded, setExpanded] = useState(false); // 控制是否展开
    const [isVisible, setIsVisible] = useState(true); // 控制面板是否可见
    const [isDragging, setIsDragging] = useState(false); // 拖拽状态
    const [position, setPosition] = useState({ x: 20, y: 20 }); // 面板位置
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 }); // 拖拽起始位置
    const panelRef = useRef<HTMLDivElement>(null);

    const { reset, growMode } = useGraphStore();
    const { gptService, gptEndpoint, gnnService, gnnEndpoint, setGptService, setGptEndpoint, setGnnService, setGnnEndpoint } = useServiceConfigStore();

    // 拖拽功能
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const newX = e.clientX - dragStart.x;
                const newY = e.clientY - dragStart.y;
                
                // 限制在视窗内
                const maxX = window.innerWidth - (expanded ? 320 : 60);
                const maxY = window.innerHeight - 60;
                
                setPosition({
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY))
                });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, expanded]);

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                setIsVisible(!isVisible);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className={styles.hideButton}
            >
                <MenuIcon className={styles.icon} />
            </button>
        );
    }

    return (
        <div
            ref={panelRef}
            className={cn(
                styles.panel,
                theme.palette.mode === 'dark' ? styles.dark : styles.light,
                expanded ? styles.expanded : styles.collapsed,
                isDragging && styles.dragging
            )}
            style={{
                left: position.x,
                top: position.y,
            }}
            onMouseDown={handleMouseDown}
        >
            {/* 拖拽句柄 */}
            <div 
                className={cn(styles.dragHandle, !expanded && styles.collapsed)}
                data-drag-handle
            >
                {expanded && (
                    <h3 className={styles.title}>控制面板</h3>
                )}
                <div className={styles.controls}>
                    <button
                        className={styles.controlButton}
                        onClick={() => setExpanded(!expanded)}
                        title={expanded ? '收起' : '展开'}
                    >
                        {expanded ? (
                            <ChevronLeft className={styles.icon} />
                        ) : (
                            <ChevronRight className={styles.icon} />
                        )}
                    </button>
                    <button
                        className={styles.controlButton}
                        onClick={() => setIsVisible(false)}
                        title="隐藏面板"
                    >
                        <X className={styles.icon} />
                    </button>
                </div>
            </div>

            {/* 面板内容 */}
            <div className={cn(styles.content, !expanded && styles.collapsed)}>
                {expanded ? (
                    <>
                        {/* 当前模式显示 */}
                        <div className={styles.modeSection}>
                            <div className={styles.modeInfo}>
                                <span className={styles.modeLabel}>当前模式</span>
                                <Badge className={styles.modeBadge}>
                                    {growMode === 'manual' ? '手动' : growMode === 'free' ? '自由' : '狂暴'}
                                </Badge>
                            </div>
                        </div>

                        <div className={styles.separator} />

                        {/* GPT 服务配置 */}
                        <div className={styles.configSection}>
                            <label className={styles.label}>GPT 服务</label>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={gptService}
                                    onChange={(e) => setGptService(e.target.value)}
                                    className={styles.select}
                                >
                                    <MenuItem value="default">默认</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        {/* GNN 服务配置 */}
                        <div className={styles.configSection}>
                            <label className={styles.label}>GNN 服务</label>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={gnnService}
                                    onChange={(e) => setGnnService(e.target.value)}
                                    className={styles.select}
                                >
                                    <MenuItem value="default">默认</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className={styles.separator} />

                        {/* 操作按钮 */}
                        <div className={styles.actions}>
                            <button
                                onClick={onPromptOpen}
                                className={styles.actionButton}
                            >
                                <MessageSquare className={styles.icon} />
                                打开提示词
                            </button>
                            <button
                                onClick={onConfigOpen}
                                className={styles.actionButton}
                            >
                                <Cog className={styles.icon} />
                                高级配置
                            </button>
                            <button
                                onClick={reset}
                                className={cn(styles.actionButton, styles.destructive)}
                            >
                                <Trash2 className={styles.icon} />
                                清空画布
                            </button>
                        </div>

                        {/* 快捷键提示 */}
                        <div className={styles.shortcutHint}>
                            按 Ctrl+B 隐藏面板
                        </div>
                    </>
                ) : (
                    <div className={cn(styles.actions, styles.collapsed)}>
                        <button
                            className={cn(styles.actionButton, styles.collapsed)}
                            onClick={onPromptOpen}
                            title="打开提示词"
                        >
                            <MessageSquare className={styles.icon} />
                        </button>
                        {/*<button*/}
                        {/*    className={cn(styles.actionButton, styles.collapsed)}*/}
                        {/*    onClick={onConfigOpen}*/}
                        {/*    title="高级配置"*/}
                        {/*>*/}
                        {/*    <Cog className={styles.icon} />*/}
                        {/*</button>*/}
                        <button
                            className={cn(styles.actionButton, styles.collapsed)}
                            onClick={reset}
                            title="清空画布"
                        >
                            <Trash2 className={styles.icon} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}