'use client'

import React from 'react'
import { useGraphStore } from '@/core/store/graph-store'
import { useTheme } from '@/context/theme-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Switch } from '@/components/ui/switch'
import LayoutPresetSelector from './layout-preset-selector'
import type { GrowMode } from '@/types/grow-mode'

type ExpandConfigPanelProps = {
  mode?: GrowMode
}

export default function ExpandConfigPanel({ mode }: ExpandConfigPanelProps) {
  const currentMode = useGraphStore((s) => s.growMode)
  const realMode = mode || currentMode
  const config = useGraphStore((s) => s.config[realMode])
  const setConfig = useGraphStore((s) => s.setConfig)
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const isMobile = useMediaQuery('(max-width: 600px)')

  const update = (key: keyof typeof config, value: number | boolean | number[]) => {
    setConfig(realMode, { [key]: value })
  }

  return (
    <div
      className={`w-full max-w-[320px] rounded-lg p-6 shadow-lg transition-colors md:p-6 ${
        isDark ? 'bg-[#1e1e1e] text-[#f0f0f0]' : 'bg-[#f9f9f9] text-black'
      } ${isMobile ? 'scale-[0.94] origin-top p-4' : ''}`}
    >
      <h3 className="mb-4 font-bold">{realMode} 配置</h3>
      <div className={`flex flex-col gap-6 ${isMobile ? 'gap-4' : 'gap-6'}`}>
        <LayoutPresetSelector />
        <div>
          <label className="mb-2 block text-sm font-medium">最大扩展深度</label>
          <input
            type="range"
            min={1}
            max={10}
            value={config.maxDepth}
            onChange={(e) => update('maxDepth', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">子节点数量范围</label>
          <input
            type="range"
            min={1}
            max={6}
            value={config.childrenRange[1]}
            onChange={(e) => update('childrenRange', [config.childrenRange[0], Number(e.target.value)])}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">生成间隔速度（ms）</label>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={config.interval}
            onChange={(e) => update('interval', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">发散角度（°）</label>
          <input
            type="range"
            min={30}
            max={360}
            value={config.angleSpread}
            onChange={(e) => update('angleSpread', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">子节点扩散半径</label>
          <input
            type="range"
            min={300}
            max={1000}
            value={config.spreadRadius}
            onChange={(e) => update('spreadRadius', Number(e.target.value))}
            className="w-full"
          />
        </div>
        <label className="flex items-center gap-2">
          <Switch checked={config.autoArrange} onCheckedChange={(v) => update('autoArrange', v)} />
          <span className="text-sm">自动排列节点</span>
        </label>
      </div>
    </div>
  )
}
