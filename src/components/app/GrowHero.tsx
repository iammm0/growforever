'use client'

import { Box, Button, Typography } from '@mui/material'
import styles from '../../styles/GrowHero.module.css'
import '@fontsource/orbitron'
import { useRouter } from 'next/navigation' // ✅ 这里！

export default function GrowHero() {
    const router = useRouter() // ✅ 这里！

    return (
        <Box className={styles.hero}>
            <Typography
                variant="h3"
                className={styles.glow}
                gutterBottom
                sx={{
                    fontFamily: '"Orbitron", sans-serif',
                }}
            >
                GrowForever
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                举棋不定让心变得复杂，至诚之心让爱变得简单。
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Ambiguity breeds difficulty; Precision fosters simplicity.
            </Typography>

            <Box className={styles.section}>
                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    sx={{ mt: 6 }}
                    onClick={() => router.push('/graph')}
                >
                    开始播种想法
                </Button>
            </Box>
        </Box>
    )
}
