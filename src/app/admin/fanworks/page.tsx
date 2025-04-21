'use client'

import { useState } from 'react'
import {
    Box,
    TextField,
    Button,
    Typography,
    Stack,
} from '@mui/material'

export default function FanworksPage() {
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [image, setImage] = useState('')

    const handleSubmit = async () => {
        const res = await fetch('/api/fanworks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, desc, image }),
        })

        if (res.ok) {
            alert('添加成功！')
            setTitle('')
            setDesc('')
            setImage('')
        } else {
            alert('添加失败')
        }
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" mb={3}>添加新的同人作品</Typography>
            <Stack spacing={2}>
                <TextField
                    label="作品标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="作品描述"
                    value={desc}
                    multiline
                    minRows={3}
                    onChange={(e) => setDesc(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="图片链接"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    fullWidth
                />
                <Button onClick={handleSubmit} variant="contained">保存</Button>
            </Stack>
        </Box>
    )
}
