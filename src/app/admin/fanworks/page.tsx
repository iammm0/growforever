'use client'

import {useState} from 'react'
import {
    Box,
    TextField,
    Button,
    Stack,
    Card,
    CardMedia,
    Chip
} from '@mui/material'
import {Fanwork} from "@/types/Fanwork";

export default function FanworksPage() {
    const [form, setForm] = useState<Fanwork>({
        title: '',
        desc: '',
        image: '',
        createdAt: new Date().toISOString(),
        author: '',
        tags: [],
        sourceLink: '',
    })

    const handleChange = <K extends keyof Fanwork>(key: K, value: Fanwork[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('filename', `fanwork_${Date.now()}_${file.name}`)
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.url) handleChange('image', data.url)
    }

    const handleSubmit = async () => {
        const res = await fetch('/api/fanworks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        if (res.ok) {
            alert('作品已保存 ✅')
            setForm({
                title: '',
                desc: '',
                image: '',
                createdAt: new Date().toISOString(),
                author: '',
                tags: [],
                sourceLink: '',
            })
        }
    }

    return (
        <Box sx={{ p: 4 }}>
            <Stack spacing={3}>
                <TextField
                    label="作品标题"
                    value={form.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                />
                <TextField
                    label="作品描述"
                    multiline
                    minRows={3}
                    value={form.desc || ''}
                    onChange={(e) => handleChange('desc', e.target.value)}
                />
                <TextField
                    label="作者"
                    value={form.author || ''}
                    onChange={(e) => handleChange('author', e.target.value)}
                />
                <TextField
                    label="来源链接"
                    value={form.sourceLink || ''}
                    onChange={(e) => handleChange('sourceLink', e.target.value)}
                />
                <TextField
                    label="标签（英文逗号分隔）"
                    value={form.tags?.join(', ') || ''}
                    onChange={(e) =>
                        handleChange(
                            'tags',
                            e.target.value
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter((tag) => tag.length > 0)
                        )
                    }
                />

                {/* 上传按钮 */}
                <Button component="label" variant="outlined">
                    上传封面图
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleUpload(file)
                        }}
                    />
                </Button>

                {/* 预览图：使用 MUI CardMedia */}
                {form.image && (
                    <Card sx={{ maxWidth: 500, borderRadius: 2 }}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={form.image}
                            alt="作品预览图"
                            sx={{ objectFit: 'cover' }}
                        />
                    </Card>
                )}

                {/* 标签预览 */}
                {form.tags && form.tags.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {form.tags.map((tag, idx) => (
                            <Chip key={idx} label={`#${tag}`} color="success" variant="outlined" />
                        ))}
                    </Box>
                )}

                <Button onClick={handleSubmit} variant="contained" color="primary">
                    保存作品
                </Button>

            </Stack>
        </Box>
    )
}
