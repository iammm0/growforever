'use client'

import { Box, Typography } from '@mui/material'
import styles from '@/styles/grow.module.css'

export default function GrowHero() {
    return (
        <Box className={styles.hero}>
            <Typography variant="h2" className={styles.glow} gutterBottom>
                GrowForever
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                模糊意味着困难，精确就意味着简单。
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Ambiguity breeds difficulty; precision fosters simplicity.
            </Typography>
        </Box>
    )
}
