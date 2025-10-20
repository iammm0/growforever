'use client'

import { IconButton } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import {useColorMode} from "@/context/theme-context";

export default function ThemeToggle() {
    const { mode, toggleColorMode } = useColorMode()

    return (
        <IconButton onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
    )
}