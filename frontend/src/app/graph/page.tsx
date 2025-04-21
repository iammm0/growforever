'use client'
import GraphCanvas from '../../components/nodes/GraphCanvas'
import ControlPanel from '../../components/nodes/ControlPanel'
import {AppBar, Box, Toolbar} from '@mui/material'
import {ReactFlowProvider} from "reactflow";

export default function GraphPage() {
    return (
        <Box display="flex" flexDirection="column" height="100vh">
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <ControlPanel />
                </Toolbar>
            </AppBar>
            <Box flex={1} height="100%" width="100%" position="relative" overflow="hidden">
                <ReactFlowProvider>
                    <GraphCanvas />
                </ReactFlowProvider>
            </Box>
        </Box>
    )
}

