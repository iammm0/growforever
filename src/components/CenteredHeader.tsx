'use client'

import {Box, Button, Typography} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CenteredHeader() {
    const router = useRouter();

    const handleClick = () => {
        router.push('/graph');
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh" // 可选：垂直居中
            textAlign="center" // 文字居中
        >
            {/* 头部标题 */}
            <Typography variant="h3" fontWeight="bold" gutterBottom>
                GrowForever - 永恒之森
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                模糊意味着困难，精确就意味着简单。
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Ambiguity breeds difficulty; precision fosters simplicity.
            </Typography>
            {/* CTA */}
            <Box mt={4} mb={6}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleClick}
                >
                    从一颗 Node 开始爆炸
                </Button>
            </Box>
        </Box>
    );
}
