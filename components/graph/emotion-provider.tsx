'use client'

import { CacheProvider } from '@emotion/react'
import React from 'react'
import createCache from "@emotion/cache";

function createEmotionCache() {
    return createCache({ key: 'css', prepend: true })
}

const clientSideEmotionCache = createEmotionCache()

export default function EmotionProvider({ children }: { children: React.ReactNode }) {
    return <CacheProvider value={clientSideEmotionCache}>{children}</CacheProvider>
}