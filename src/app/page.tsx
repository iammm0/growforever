'use client'

import { Container, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#000',
            paper: '#111',
        },
        text: {
            primary: '#fff',
            secondary: '#aaa',
        },
    },
    typography: {
        fontFamily: `'Noto Sans SC', 'Helvetica Neue', 'Arial', sans-serif`,
        h2: {
            fontWeight: 700,
        },
    },
})

export default function HomePage() {
    const router = useRouter()

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container
                maxWidth="md"
                sx={{
                    mt: 15,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h2" gutterBottom>
                    GrowForever - 永恒之森
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                    一个基于图结构的人工智能可视化探索工具
                </Typography>
                <Typography variant="body1" sx={{ mt: 3, mb: 5, maxWidth: 600 }}>
                    在这里，你可以从一个简单的想法开始，逐步延伸出无限的关联与分支，构建属于你自己的知识森林。
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{
                        px: 6,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        borderRadius: 2,
                    }}
                    onClick={() => router.push('/graph')}
                >
                    开始使用
                </Button>
            </Container>
        </ThemeProvider>
    )
}
