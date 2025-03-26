'use client'

import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'
import ReactFlow, { Background, Controls, Edge, MiniMap} from 'reactflow'
import 'reactflow/dist/style.css'

export default function MuiExamplePage() {
    const initialNodes = [
        {
            id: '1',
            position: {x: 100, y: 100},
            data: {label: 'MUI 节点示例'},
            type: 'default',
        },
    ]

    const initialEdges: Edge[] | undefined = []

    return (
        <Box p={4} sx={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
            <Typography variant="h4" gutterBottom>
                🌿 GrowForever - MUI 示例界面
            </Typography>

            <Card sx={{ mb: 4, maxWidth: 500 }}>
                <CardContent>
                    <Typography variant="h6">创建一个新节点</Typography>
                    <Box display="flex" gap={2} mt={2}>
                        <TextField label="节点名称" variant="outlined" size="small" fullWidth />
                        <Button variant="contained" color="primary">
                            创建
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
                🖼️ 下方是一个 ReactFlow 画布（与 MUI 同时渲染）
            </Typography>

            <Box height={400} borderRadius={2} overflow="hidden" boxShadow={2}>
                <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
                    <MiniMap />
                    <Controls />
                    <Background gap={16} size={1} />
                </ReactFlow>
            </Box>
        </Box>
    )
}

