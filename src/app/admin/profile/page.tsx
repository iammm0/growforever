'use client'

import { useEffect, useState } from 'react'
import {
    Box,
    TextField,
    Button,
    Typography,
    Stack,
} from '@mui/material'

export default function EditProfilePage() {
    const [form, setForm] = useState({
        name: '',
        style: '',
        bio: '',
    })

    const loadProfile = async () => {
        const res = await fetch('/api/profile')
        const data = await res.json()
        setForm(data)
    }

    useEffect(() => {
        loadProfile()
    }, [])

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value })
    }

    const handleSave = async () => {
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        if (res.ok) alert('保存成功')
        else alert('保存失败')
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" mb={3}>编辑艺术家主页信息</Typography>
            <Stack spacing={2}>
                <TextField
                    label="姓名"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
                <TextField
                    label="风格"
                    value={form.style}
                    onChange={(e) => handleChange('style', e.target.value)}
                />
                <TextField
                    label="简介"
                    value={form.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    multiline
                    minRows={4}
                />
                <Button onClick={handleSave} variant="contained">保存</Button>
            </Stack>
        </Box>
    )
}
