'use client'

import { CacheProvider } from '@emotion/react'
import React from 'react'
import createEmotionCache from "../../lib/emotion-cache";

const clientSideEmotionCache = createEmotionCache()

export default function EmotionProvider({ children }: { children: React.ReactNode }) {
    return <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
}
