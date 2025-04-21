import fs from 'fs/promises'
import path from 'path'
import Image from 'next/image'
import { Paper, Typography, Box } from '@mui/material'
import styles from './artistWork.module.css'

export default async function ArtistWorkPage() {
    const uploadsDir = path.join(process.cwd(), 'public/uploads')
    const files = await fs.readdir(uploadsDir)
    const images = files.filter((file) =>
        /\.(jpg|jpeg|png|webp)$/i.test(file)
    )

    return (
        <Box className={styles.container}>
            {images.map((filename, i) => (
                <Paper key={i} className={styles.imageWrapper} elevation={3}>
                    <Image
                        src={`/uploads/${filename}`}
                        alt={`作品 ${i + 1}`}
                        width={960}
                        height={540}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                        sizes="(max-width: 1024px) 100vw, 960px"
                    />
                </Paper>
            ))}
        </Box>
    )
}
