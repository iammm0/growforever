'use client'

import React, { ReactNode } from 'react'
import Providers from '@/context/theme-context'

export default function RootProviders({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>
}
