'use client'

import React from 'react'
import {
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  InputLabel,
  Stack
} from '@mui/material'
import { useMediaQuery, useTheme } from '@mui/system'
import clsx from 'clsx'

import { useGraphStore } from '@/lib/graphStore'
import { GrowMode } from '@/types/GrowthNode'
import LayoutPresetSelector from '@/components/graph/LayoutPresetSelector'

import styles from '../../styles/ExpandConfigPanel.module.css'

type ExpandConfigPanelProps = {
  mode?: GrowMode
}

export default function ExpandConfigPanel({ mode }: ExpandConfigPanelProps) {
  // 获取当前模式 & 配置
  const currentMode = useGraphStore((s) => s.growMode)
  const realMode = mode || currentMode
  const config = useGraphStore((s) => s.config[realMode])
  const setConfig = useGraphStore((s) => s.setConfig)

  // 主题判断
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // 通用更新函数
  const update = (
    key: keyof typeof config,
    value: number | boolean | number[]
  ) => {
    setConfig(realMode, { [key]: value })
  }

  return (
    <Box
      className={clsx(
        styles.container,
        isDark ? styles.dark : styles.light
      )}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {realMode} 配置
      </Typography>

      <Stack spacing={isMobile ? 2 : 3}>
        {/* 布局模板选择器 */}
        <LayoutPresetSelector />

        {/* 最大扩展深度 */}
        <Box>
          <InputLabel>最大扩展深度</InputLabel>
          <Slider
            value={config.maxDepth}
            onChange={(_, val) => update('maxDepth', val)}
            min={1}
            max={10}
          />
        </Box>

        {/* 子节点数量范围 */}
        <Box>
          <InputLabel>子节点数量范围</InputLabel>
          <Slider
            value={config.childrenRange}
            onChange={(_, val) => update('childrenRange', val)}
            valueLabelDisplay="auto"
            min={1}
            max={6}
          />
        </Box>

        {/* 生成间隔速度（ms） */}
        <Box>
          <InputLabel>生成间隔速度（ms）</InputLabel>
          <Slider
            value={config.interval}
            onChange={(_, val) => update('interval', val)}
            min={50}
            max={2000}
            step={50}
          />
        </Box>

        {/* 发散角度（°） */}
        <Box>
          <InputLabel>发散角度（°）</InputLabel>
          <Slider
            value={config.angleSpread}
            onChange={(_, val) => update('angleSpread', val)}
            min={30}
            max={360}
          />
        </Box>

        {/* 子节点扩散半径 */}
        <Box>
          <InputLabel>子节点扩散半径</InputLabel>
          <Slider
            value={config.spreadRadius}
            onChange={(_, val) => update('spreadRadius', val)}
            min={300}
            max={1000}
          />
        </Box>

        {/* 自动排列节点 */}
        <FormControlLabel
          control={
            <Switch
              checked={config.autoArrange}
              onChange={(_, checked) => update('autoArrange', checked)}
            />
          }
          label="自动排列节点"
        />
      </Stack>
    </Box>
  )
}
