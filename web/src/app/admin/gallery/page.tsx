'use client'

import { useState } from 'react'
import {
    Typography,
    Button,
    Stack,
    Alert,
    Box
} from '@mui/material'
import styles from './uploadGallery.module.css'
import Image from 'next/image'


export default function UploadGalleryPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        setFile(selectedFile)

        if (selectedFile) {
            const fileUrl = URL.createObjectURL(selectedFile)
            setPreview(fileUrl)
        } else {
            setPreview(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            setMessage('❌ 仅支持 JPG / PNG / WEBP 格式')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('❌ 文件大小不能超过 5MB')
            return
        }

        const formData = new FormData()
        formData.append('image', file)

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        })

        if (res.ok) {
            setMessage('✅ 上传成功')
            setFile(null)
            setPreview(null)
        } else {
            setMessage('❌ 上传失败')
        }
    }

    return (
        <div className={styles.container}>
            <Typography variant="h5" gutterBottom>
                上传新的作品图像
            </Typography>

            <Stack spacing={2}>
                <Button variant="outlined" component="label">
                    选择图片
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleChange}
                    />
                </Button>

                {preview && (
                    <Box
                        sx={{
                            mt: 2,
                            width: '100%',
                            maxWidth: 500,
                            height: 300,
                            position: 'relative',
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 2,
                        }}
                    >
                        <Image
                            src={preview}
                            alt="预览图"
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="(max-width: 768px) 100vw, 500px"
                        />
                    </Box>
                )}


                <Button
                    onClick={handleUpload}
                    variant="contained"
                    disabled={!file}
                >
                    上传
                </Button>

                {message && (
                    <Alert severity={message.startsWith('✅') ? 'success' : 'error'}>
                        {message}
                    </Alert>
                )}
            </Stack>
        </div>
    )
}
