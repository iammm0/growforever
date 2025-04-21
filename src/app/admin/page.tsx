// app/admin/page.tsx
'use client'

import Link from 'next/link'
import { Button, Stack, Typography } from '@mui/material'

export default function AdminHomePage() {
    return (
        <Stack spacing={3} alignItems="center">
            <Typography variant="h6" color="text.secondary">
                请选择一个操作：
            </Typography>

            <Link href="/admin/gallery" passHref>
                <Button variant="contained" color="primary" size="large">
                    🖼️ 上传作品图像
                </Button>
            </Link>

            <Link href="/admin/fanworks" passHref>
                <Button variant="contained" color="secondary" size="large">
                    🎨 添加同人作品
                </Button>
            </Link>

            <Link href="/admin/profile" passHref>
                <Button variant="contained" color="success" size="large">
                    🧾 编辑艺术家资料
                </Button>
            </Link>
        </Stack>
    )
}
