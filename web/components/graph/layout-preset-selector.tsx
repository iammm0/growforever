'use client'

import { useGraphStore } from '@/core/store/graph-store'
import { Button } from '@/components/ui/button'

const layoutNames = {
  tree: '🌲 树状',
  circle: '⭕ 圆形',
  star: '⭐ 星形',
} as const

export default function LayoutPresetSelector() {
  const growMode = useGraphStore((s) => s.growMode)
  const setConfig = useGraphStore((s) => s.setConfig)

  const handleSelect = (type: keyof typeof layoutNames) => {
    const presets = {
      tree: { spreadRadius: 500, angleSpread: 60, autoArrange: true },
      circle: { spreadRadius: 500, angleSpread: 360, autoArrange: true },
      star: { spreadRadius: 500, angleSpread: 180, autoArrange: true },
    }
    setConfig(growMode, presets[type])
  }

  return (
    <div>
      <h4 className="mb-2 font-bold">💠 布局模板预设</h4>
      <div className="flex flex-wrap gap-2">
        {(Object.entries(layoutNames) as [keyof typeof layoutNames, string][]).map(([key, label]) => (
          <Button key={key} variant="outline" size="sm" onClick={() => handleSelect(key)}>
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
