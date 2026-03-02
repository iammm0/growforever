'use client'

import React, { useMemo, useRef, useState } from 'react'
import {
    Box, Button, Chip, CircularProgress, FormControl, InputLabel, MenuItem, Select,
    Slider, Stack, TextField, Typography, IconButton, Tooltip, Switch, FormControlLabel
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import StopIcon from '@mui/icons-material/Stop'
import { motion } from 'framer-motion'

type Mode = 'rewrite' | 'continue' | 'summarize'

export default function ExpandPage() {
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

    const addHint = () => {
        const s = hintInput.trim()
        if (!s) return
        if (!hints.includes(s)) setHints(prev => [...prev, s])
        setHintInput('')
    }

    const removeHint = (h: string) => setHints(prev => prev.filter(x => x !== h))

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

        const body = {
            mode, input, hints, temperature, maxTokens,
        }

        const ctrl = new AbortController()
        abortRef.current = ctrl

        try {
            if (!stream) {
                // 非流式
                const res = await fetch('/api/expand', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: ctrl.signal,
                })
                const data = await res.json()
                setOutput(data?.text ?? '')
            } else {
                // 流式：POST + 读取 SSE 块
                const res = await fetch('/api/expand?stream=1', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: ctrl.signal,
                })
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

                        // SSE 行以 \n 分隔
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
                                if (typeof delta === 'string') {
                                    setOutput(prev => prev + delta)
                                }
                            } catch {
                                // 某些服务可能会发送非 JSON 的心跳，忽略即可
                            }
                        }
                    }
                }
            }
        } catch (e: any) {
            if (e?.name === 'AbortError') {
                setOutput(prev => prev + '\n[已中止]')
            } else {
                setOutput(prev => prev + `\n[错误] ${String(e)}`)
            }
        } finally {
            setLoading(false)
            abortRef.current = null
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                px: { xs: 2, md: 4 },
                py: 4,
                background: theme => theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg,#0f172a,#1e293b)'
                    : 'linear-gradient(135deg,#f8fafc,#e2e8f0)',
            }}
        >
            <Stack spacing={3} maxWidth={1200} mx="auto">
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                    <Typography variant="h4" fontWeight={800}>
                        文本扩展
                    </Typography>
                </motion.div>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    {/* 左侧：输入控制区 */}
                    <Stack flex={1} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel id="mode-label">模式</InputLabel>
                            <Select
                                labelId="mode-label"
                                label="模式"
                                value={mode}
                                onChange={(e) => setMode(e.target.value as Mode)}
                            >
                                <MenuItem value="rewrite">改写（保持原意）</MenuItem>
                                <MenuItem value="continue">续写（延续风格）</MenuItem>
                                <MenuItem value="summarize">摘要（要点提炼）</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="输入文本"
                            placeholder="在这里粘贴或输入需要处理的文本…"
                            multiline
                            minRows={8}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            fullWidth
                        />

                        <Box>
                            <Typography variant="caption" color="text.secondary">Hints（按回车添加）</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="例如：学术语气、口语化、保留数字…"
                                value={hintInput}
                                onChange={(e) => setHintInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        addHint()
                                    }
                                }}
                                sx={{ mt: 1 }}
                            />
                            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                                {hints.map(h => (
                                    <Chip key={h} label={h} onDelete={() => removeHint(h)} />
                                ))}
                            </Stack>
                        </Box>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                            <Box flex={1}>
                                <Typography variant="caption">Temperature：{temperature.toFixed(2)}</Typography>
                                <Slider
                                    min={0} max={2} step={0.01}
                                    value={temperature}
                                    onChange={(_, v) => setTemperature(v as number)}
                                />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="caption">Max Tokens：{maxTokens}</Typography>
                                <Slider
                                    min={64} max={4096} step={64}
                                    value={maxTokens}
                                    onChange={(_, v) => setMaxTokens(v as number)}
                                />
                            </Box>
                            <FormControlLabel
                                control={<Switch checked={stream} onChange={(_, v) => setStream(v)} />}
                                label="流式输出"
                            />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                onClick={onSubmit}
                                disabled={!canSubmit}
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                            >
                                {loading ? '生成中…' : '开始生成'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={stop}
                                disabled={!loading}
                                startIcon={<StopIcon />}
                            >
                                停止
                            </Button>
                        </Stack>
                    </Stack>

                    {/* 右侧：输出区 */}
                    <Stack flex={1} spacing={1}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle1" fontWeight={700}>输出</Typography>
                            <Tooltip title="复制到剪贴板">
                <span>
                  <IconButton onClick={handleCopy} disabled={!output}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </span>
                            </Tooltip>
                        </Stack>
                        <Box
                            sx={{
                                p: 2,
                                minHeight: 280,
                                borderRadius: 2,
                                bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                border: theme => `1px solid ${theme.palette.divider}`,
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace)',
                            }}
                        >
                            {output || (loading ? '正在生成…' : '生成内容会显示在这里')}
                        </Box>
                    </Stack>
                </Stack>
            </Stack>
        </Box>
    )
}