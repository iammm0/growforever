'use client'

import Link from 'next/link'
import styles from '../../styles/AdminButtonPanel.module.css'
import {Box} from "@mui/material";


export default function AdminHomePage() {
    return (
        <Box className={styles.wrapper}>
            <Link href="/admin/gallery">
                <button className={styles.glassButton}>
                    <span>📁 上传作品图像</span>
                </button>
            </Link>
            <Link href="/admin/fanworks">
                <button className={styles.glassButton}>
                    <span>🎨 添加同人作品</span>
                </button>
            </Link>
            <Link href="/admin/profile">
                <button className={styles.glassButton}>
                    <span>🧑‍🎤 编辑艺术家资料</span>
                </button>
            </Link>
        </Box>
    )
}
