'use client'

import { useState } from 'react'
import { Button, Typography, Box } from '@mui/material'

export default function UploadGalleryPage() {
    const [file, setFile] = useState<File | null>(null)

    const handleUpload = async () => {
        if (!file) return

        const formData = new FormData()
        formData.append('image', file)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        if (res.ok) alert('上传成功')
        else alert('上传失败')
    }

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom>上传新的作品图像</Typography>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <br />
            <Button onClick={handleUpload} variant="contained" sx={{ mt: 2 }}>
                上传
            </Button>
        </Box>
    )
}
