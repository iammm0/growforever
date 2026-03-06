'use client'

import { useState, useRef, useEffect } from 'react'
import { Menu, ChevronLeft, ChevronRight, X, Trash2, MessageSquare } from 'lucide-react'
import { useGraphStore } from '@/core/store/graph-store'
import { useServiceConfigStore } from '@/core/store/service-store'
import { useTheme } from '@/context/theme-context'
import { useMediaQuery } from '@/hooks/use-media-query'
import { Button } from '@/components/ui/button'

interface ControlPanelProps {
  onPromptOpen?: () => void
  onConfigOpen?: () => void
}

export default function ControlPanel({ onPromptOpen, onConfigOpen }: ControlPanelProps) {
  const { actualMode } = useTheme()
  const isMobile = useMediaQuery('(max-width: 600px)')
  const isDark = actualMode === 'dark'
  const [expanded, setExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

  const { reset, growMode } = useGraphStore()
  const { gptService, gnnService, setGptService, setGnnService } = useServiceConfigStore()

  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/20' : 'border-black/15'
  const bgColor = isDark ? 'bg-black/60' : 'bg-white/15'

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        const maxX = window.innerWidth - (expanded ? 320 : 60)
        const maxY = window.innerHeight - 60
        setPosition({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) })
      }
    }
    const handleMouseUp = () => setIsDragging(false)
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
      <button
        type="button"
        onClick={() => setIsVisible(true)}
        className="fixed left-4 top-4 z-[60] flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:shadow-xl"
      >
        <Menu className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div
      ref={panelRef}
      className={`fixed z-50 flex min-h-[120px] flex-col overflow-hidden rounded-xl border backdrop-blur-xl transition-all ${
        expanded ? 'w-80' : 'w-16'
      } ${borderColor} ${bgColor} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} shadow-2xl`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
    >
      <div
        data-drag-handle
        className={`flex cursor-grab items-center justify-between border-b ${borderColor} bg-primary/5 p-2 active:cursor-grabbing ${
          expanded ? 'p-3' : 'p-2'
        }`}
      >
        {expanded && (
          <span className="font-bold text-primary">控制面板</span>
        )}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`rounded p-1 ${textColor} transition-colors hover:bg-primary/10`}
          >
            {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className={`rounded p-1 ${textColor} transition-colors hover:bg-primary/10`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={`flex-1 p-2 transition-all ${expanded ? 'p-4' : 'p-2'}`}>
        {expanded ? (
          <>
            <div className="mb-4">
              <label className={`mb-1 block text-xs opacity-80 ${textColor}`}>GPT 服务</label>
              <select
                value={gptService}
                onChange={(e) => setGptService(e.target.value)}
                className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm ${borderColor} ${textColor}`}
              >
                <option value="default">默认</option>
              </select>
            </div>
            <div className="mb-4">
              <label className={`mb-1 block text-xs opacity-80 ${textColor}`}>GNN 服务</label>
              <select
                value={gnnService}
                onChange={(e) => setGnnService(e.target.value)}
                className={`w-full rounded-md border bg-transparent px-3 py-2 text-sm ${borderColor} ${textColor}`}
              >
                <option value="default">默认</option>
              </select>
            </div>
            <div className={`my-3 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={onPromptOpen}
                className={`w-full justify-start border ${borderColor} bg-primary/5 ${textColor} hover:border-primary hover:bg-primary/15`}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                打开提示词
              </Button>
              <Button
                variant="destructive"
                onClick={reset}
                className="w-full justify-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清空画布
              </Button>
            </div>
            <p className={`mt-2 text-center text-xs opacity-60 ${textColor}`}>按 Ctrl+B 隐藏面板</p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={onPromptOpen}
              className={`rounded p-2 ${textColor} transition-colors hover:bg-primary/10`}
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded p-2 text-red-500 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
