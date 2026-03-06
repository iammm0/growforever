'use client'

import React, { useMemo, useRef, useState } from 'react'
import { useTheme } from '@/context/theme-context'
import GlobalBackground from '@/components/presentation/global-background'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Copy, Square, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

type Mode = 'rewrite' | 'continue' | 'summarize'

export default function ExpandPage() {
  const { actualMode } = useTheme()
  const isDark = actualMode === 'dark'
  const [mode, setMode] = useState<Mode>('rewrite')
  const [input, setInput] = useState('')
  const [hintInput, setHintInput] = useState('')
  const [hints, setHints] = useState<string[]>([])
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(512)
  const [stream, setStream] = useState(true)
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const abortRef = useRef<AbortController | null>(null)

  const canSubmit = useMemo(() => input.trim().length > 0 && !loading, [input, loading])
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/10' : 'border-black/10'

  const addHint = () => {
    const s = hintInput.trim()
    if (!s) return
    if (!hints.includes(s)) setHints((prev) => [...prev, s])
    setHintInput('')
  }

  const removeHint = (h: string) => setHints((prev) => prev.filter((x) => x !== h))

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
  }

  const stop = () => {
    abortRef.current?.abort()
    abortRef.current = null
    setLoading(false)
  }

  async function onSubmit() {
    setOutput('')
    setLoading(true)
    const body = { mode, input, hints, temperature, maxTokens }
    const ctrl = new AbortController()
    abortRef.current = ctrl
    try {
      if (!stream) {
        const res = await fetch('/api/expand', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal })
        const data = await res.json()
        setOutput(data?.text ?? '')
      } else {
        const res = await fetch('/api/expand?stream=1', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal })
        if (!res.ok || !res.body) {
          setOutput(`请求失败：${res.status}`)
        } else {
          const reader = res.body.getReader()
          const decoder = new TextDecoder('utf-8')
          let buffer = ''
          while (true) {
            const { value, done } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''
            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const payload = trimmed.slice(5).trim()
              if (payload === '[DONE]') continue
              try {
                const json = JSON.parse(payload)
                const delta = json?.choices?.[0]?.delta?.content
                if (typeof delta === 'string') setOutput((prev) => prev + delta)
              } catch {}
            }
          }
        }
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') setOutput((prev) => prev + '\n[已中止]')
      else setOutput((prev) => prev + `\n[错误] ${String(e)}`)
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  return (
    <div className={`relative min-h-screen px-4 py-8 md:px-8 ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 to-slate-200'}`}>
      <GlobalBackground mobilePosDark="center" mobilePosLight="center" desktopPosDark="center" desktopPosLight="center" mobileZoom={1.0} overlay={true} />
      <div className="relative z-10 mx-auto max-w-[1200px] space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-3xl font-extrabold ${textColor}`}>文本扩展</h1>
        </motion.div>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 space-y-4">
            <div>
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>模式</label>
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger className={`border ${borderColor} bg-transparent ${textColor}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rewrite">改写（保持原意）</SelectItem>
                  <SelectItem value="continue">续写（延续风格）</SelectItem>
                  <SelectItem value="summarize">摘要（要点提炼）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={`mb-2 block text-sm font-medium ${textColor}`}>输入文本</label>
              <Textarea placeholder="在这里粘贴或输入需要处理的文本…" value={input} onChange={(e) => setInput(e.target.value)} rows={8} className={`border ${borderColor} bg-transparent ${textColor}`} />
            </div>
            <div>
              <label className={`mb-2 block text-sm opacity-80 ${textColor}`}>Hints（按回车添加）</label>
              <Input placeholder="例如：学术语气、口语化、保留数字…" value={hintInput} onChange={(e) => setHintInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHint())} className={`mt-1 border ${borderColor} bg-transparent ${textColor}`} />
              <div className="mt-2 flex flex-wrap gap-2">
                {hints.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm">
                    {h}
                    <button type="button" onClick={() => removeHint(h)} className="hover:opacity-80">×</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`text-sm ${textColor}`}>Temperature：{temperature.toFixed(2)}</label>
                <input type="range" min={0} max={2} step={0.01} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className={`text-sm ${textColor}`}>Max Tokens：{maxTokens}</label>
                <input type="range" min={64} max={4096} step={64} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} className="w-full" />
              </div>
              <label className="flex items-center gap-2">
                <Switch checked={stream} onCheckedChange={setStream} />
                <span className={`text-sm ${textColor}`}>流式输出</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="grow" onClick={onSubmit} disabled={!canSubmit}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? '生成中…' : '开始生成'}
              </Button>
              <Button variant="destructive" onClick={stop} disabled={!loading}>
                <Square className="mr-2 h-4 w-4" />
                停止
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className={`font-bold ${textColor}`}>输出</h3>
              <button type="button" onClick={handleCopy} disabled={!output} title="复制到剪贴板" className={`rounded p-2 transition-opacity hover:opacity-80 disabled:opacity-50 ${textColor}`}>
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <div className={`min-h-[280px] rounded-xl border p-4 font-mono text-sm whitespace-pre-wrap ${borderColor} ${isDark ? 'bg-white/5' : 'bg-black/5'} ${textColor}`}>
              {output || (loading ? '正在生成…' : '生成内容会显示在这里')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
