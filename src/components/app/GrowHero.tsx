'use client'

import { Box, Typography } from '@mui/material'
import styles from '../../styles/GrowHero.module.css'

export default function GrowHero() {
    return (
        <Box
            className={styles.hero}
        >
            <Typography variant="h2" className={styles.glow} gutterBottom>
                GrowForever
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                举棋不定让心变得复杂，至诚之心让爱变得简单。
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Ambiguity breeds difficulty; Precision fosters simplicity.
            </Typography>
        </Box>
    )
}