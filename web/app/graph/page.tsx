'use client'
import GraphCanvas from '../../components/graph/GraphCanvas'
import {AppBar, Box, Toolbar} from '@mui/material'
import {ReactFlowProvider} from "reactflow";
import ControlPanel from "../../components/graph/ControlPanel";
import MobileDesktopSuggest from "@/components/app/MobileDesktopSuggest";

export default function GraphPage() {
    const desktopUrl =
    typeof window !== 'undefined' ? window.location.href : 'https://growforver.physicistscard.com/graph'

    return (
        <>
        <MobileDesktopSuggest desktopUrl={desktopUrl} />
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
        </>
    )
}

