import fs from 'fs/promises'
import path from 'path'
import styles from './artistProfile.module.css'
import { Box, Avatar, Typography, Paper } from '@mui/material'

export default async function ArtistProfilePage() {
    const filePath = path.join(process.cwd(), 'data/profile.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const profile = JSON.parse(file)

    return (
        <Box className={styles.root}>
            <Box className={styles.header}>
                <Avatar
                    src={profile.avatar || ''}
                    alt={profile.name}
                    sx={{
                        width: 120,
                        height: 120,
                        boxShadow: 3,
                        fontSize: 40,
                        bgcolor: '#9ccc65',
                    }}
                >
                    {!profile.avatar && profile.name?.[0]}
                </Avatar>

                <Box>
                    <Typography variant="h4" component="h1" color="primary" fontWeight={600}>
                        {profile.name}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" mt={1}>
                        风格：{profile.style}
                    </Typography>
                </Box>
            </Box>

            <Paper className={styles.bioSection} elevation={2} sx={{ padding: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    艺术家简介
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {profile.bio}
                </Typography>
            </Paper>
        </Box>
    )
}

