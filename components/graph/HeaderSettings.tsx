import React, { useState } from 'react'
import ConfigDrawer from './ConfigDrawer'
import SettingsIcon from '@mui/icons-material/Settings'
import { IconButton } from '@mui/material'

export default function HeaderSettings() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <SettingsIcon />
            </IconButton>
            <ConfigDrawer open={open} closeAction={() => setOpen(false)} />
        </>
    )
}