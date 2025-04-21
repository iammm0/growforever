'use client'

import { useEffect, useState } from 'react'
import {
    Box,
    TextField,
    Button,
    Stack,
    Avatar,
    Typography
} from '@mui/material'
import { ArtistProfile } from '@/types/ArtistProfile'
import styles from './EditProfileForm.module.css'

const defaultProfile: ArtistProfile = {
    name: '',
    style: '',
    bio: '',
    avatar: '',
    email: '',
    website: '',
}

export default function EditProfileForm() {
    const [form, setForm] = useState<ArtistProfile>(defaultProfile)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/profile')
            .then((res) => res.json())
            .then((data) => setForm({ ...defaultProfile, ...data }))
            .catch(() => setForm(defaultProfile))
    }, [])

    const handleChange = <K extends keyof ArtistProfile>(key: K, value: ArtistProfile[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleAvatarUpload = async (file: File) => {
        const formData = new FormData()
        formData.append('image', file)
        formData.append('filename', `avatar_${file.name}`)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        const data = await res.json()
        if (data.url) {
            setForm((prev) => ({ ...prev, avatar: data.url }))
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        setLoading(false)

        if (res.ok) {
            alert('✅ 保存成功')
        } else {
            alert('❌ 保存失败')
        }
    }

    return (
        <div className={styles.container}>
            <Typography variant="h5" gutterBottom>
                编辑艺术家主页信息
            </Typography>

            <Stack spacing={3}>
                <TextField
                    label="姓名"
                    value={form.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                />
                <TextField
                    label="风格"
                    value={form.style || ''}
                    onChange={(e) => handleChange('style', e.target.value)}
                />
                <TextField
                    label="简介"
                    multiline
                    minRows={3}
                    value={form.bio || ''}
                    onChange={(e) => handleChange('bio', e.target.value)}
                />
                <TextField
                    label="Email"
                    value={form.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                />
                <TextField
                    label="个人网站"
                    value={form.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                />

                <Box className={styles.avatarRow}>
                    <Avatar src={form.avatar || ''} sx={{ width: 64, height: 64 }} />
                    <Button variant="outlined" component="label">
                        上传头像
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleAvatarUpload(file)
                            }}
                        />
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? '保存中...' : '保存'}
                </Button>
            </Stack>
        </div>
    )
}

