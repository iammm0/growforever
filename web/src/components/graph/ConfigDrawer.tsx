'use client'

import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    Tabs,
    Tab,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ExpandConfigPanel from '@/components/graph/ExpandConfigPanel'
import {useState} from 'react'
import {GrowMode} from '@/types/GrowthNode'
import {useGraphStore} from '@/lib/graphStore'

type Props = {
    open: boolean,
    closeAction: () => void,
}

const modeLabelMap = {
    manual: '手动模式',
    free: '自由模式',
    fury: '狂暴模式',
}

export default function ConfigDrawer({open, closeAction}: Props) {
    const [tab, setTab] = useState<GrowMode>('manual')
    const setMode = useGraphStore((s) => s.setGrowMode)

    return (
        <Drawer anchor="right" open={open} onClose={closeAction}>
            <Box sx={{width: 400, p: 3}}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">高级配置</Typography>
                    <IconButton onClick={closeAction}>
                        <CloseIcon/>
                    </IconButton>
                </Box>

                <Divider sx={{my: 2}}/>

                <Tabs
                    value={tab}
                    onChange={(_, val) => setTab(val)}
                    textColor="secondary"
                    indicatorColor="secondary"
                >
                    <Tab value="manual" label="手动"/>
                    <Tab value="free" label="自由"/>
                    <Tab value="fury" label="狂暴"/>
                </Tabs>

                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 400,
                        mx: 'auto',
                        px: 2,
                        py: 3,
                    }}
                >
                    <ExpandConfigPanel mode={tab}/>
                    <Box mt={2}>
                        <Typography variant="caption" color="textSecondary">
                            当前配置模式：
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold">
                            {modeLabelMap[tab]}
                        </Typography>
                        <Box mt={1}>
                            <button
                                onClick={() => setMode(tab)}
                                className="bg-black text-white py-1 px-4 rounded"
                            >
                                应用此模式
                            </button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}
