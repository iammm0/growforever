'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { useGraphStore } from '@/core/store/graph-store'
import { useTheme } from '@/context/theme-context'
import ExpandConfigPanel from './expand-config-panel'
import type { GrowMode } from '@/types/grow-mode'

const modeLabelMap: Record<GrowMode, string> = {
  manual: '手动模式',
  free: '自由模式',
  fury: '狂暴模式',
}

type Props = {
  open: boolean
  closeAction: () => void
}

export default function ConfigDrawer({ open, closeAction }: Props) {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const [tab, setTab] = useState<GrowMode>('manual')
  const setMode = useGraphStore((s) => s.setGrowMode)

  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/10' : 'border-black/10'
  const bgColor = isDark ? 'bg-black/80' : 'bg-white/90'

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={closeAction}
        aria-hidden
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[280px] border-l p-6 backdrop-blur-xl sm:w-80 md:w-[420px] md:p-8 ${borderColor} ${bgColor}`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${textColor}`}>高级配置</h2>
          <button
            type="button"
            onClick={closeAction}
            className={`rounded p-1 ${textColor} transition-colors hover:bg-white/10`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={`mb-6 h-px ${borderColor}`} />
        <div className="mb-6 flex gap-2 rounded-lg border p-1 border-border">
          {(['manual', 'free', 'fury'] as GrowMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setTab(m)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === m ? 'bg-primary text-primary-foreground' : textColor
              }`}
            >
              {modeLabelMap[m]}
            </button>
          ))}
        </div>
        <div>
          <ExpandConfigPanel mode={tab} />
          <div className="mt-6">
            <p className={`mb-1 text-xs opacity-70 ${textColor}`}>当前配置模式：</p>
            <p className={`mb-3 text-sm font-medium ${textColor}`}>{modeLabelMap[tab]}</p>
            <button
              type="button"
              onClick={() => setMode(tab)}
              className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:bg-primary/90"
            >
              应用此模式
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
