'use client'

import { Button, Container, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const router = useRouter()

    return (
        <Container maxWidth="md" sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h2" gutterBottom fontWeight="bold">
                🌳 GrowForever - 永恒之森
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
                一个基于图结构的人工智能可视化探索工具
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
                在这里，你可以从一个简单的想法开始，逐步延伸出无限的关联与分支，构建属于你自己的知识森林。
            </Typography>
            <Button
                variant="contained"
                color="success"
                size="large"
                onClick={() => router.push('/graph')}
            >
                🚀 开始使用
            </Button>
        </Container>
    )
}
