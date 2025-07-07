'use client'

import { CacheProvider } from '@emotion/react'
import React from 'react'
import createEmotionCache from "@/src/lib/emotionCache";

const clientSideEmotionCache = createEmotionCache()

export default function EmotionProvider({ children }: { children: React.ReactNode }) {
    return <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
}
