'use client'

import { CacheProvider } from '@emotion/react'
import createEmotionCache from '../../lib/emotionCache'
import React from 'react'

const clientSideEmotionCache = createEmotionCache()

export default function EmotionProvider({ children }: { children: React.ReactNode }) {
    return <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
}
