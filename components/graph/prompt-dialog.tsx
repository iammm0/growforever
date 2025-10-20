'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
} from '@mui/material'
import { useSeedApi } from '@/hooks/useSeed'

interface PromptDialogProps {
    open: boolean
    onClose: () => void
}

export default function PromptDialog({ open, onClose }: PromptDialogProps) {
    const { createSeed, expandSeed } = useSeedApi()
    const [seedId, setSeedId] = useState<number | null>(null)
    const [title, setTitle] = useState('')
    const [prompt, setPrompt] = useState('')

    const handleCreateSeed = async () => {
        try {
            const seed = await createSeed({ title })
            setSeedId(seed.id)
        } catch (error) {
            console.error('创建种子失败', error)
        }
    }

    const handleExpand = async () => {
        if (seedId == null) return
        try {
            await expandSeed(seedId, { prompt })
        } catch (error) {
            console.error('扩展种子失败', error)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>提示词配置</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="种子标题"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="提示词"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                    />
                    {seedId && <div>当前种子ID: {seedId}</div>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>关闭</Button>
                <Button onClick={handleCreateSeed} variant="outlined">
                    新建种子
                </Button>
                <Button
                    onClick={handleExpand}
                    variant="contained"
                    disabled={seedId == null}
                >
                    更新并扩展
                </Button>
            </DialogActions>
        </Dialog>
    )
}

