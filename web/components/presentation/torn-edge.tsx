'use client'

import { useTheme } from '@/context/theme-context'

export default function TornEdge() {
  const { actualMode } = useTheme()
  const bgColor = actualMode === 'dark' ? '#121212' : '#ffffff'

  return (
    <div className="relative top-0 h-10 w-full overflow-hidden leading-none">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="block h-[120%] w-[calc(150%+1.3px)] rotate-180"
      >
        <path
          d="M0,0 C150,100 350,0 600,60 C850,120 1050,20 1200,80 L1200,0 L0,0 Z"
          fill={bgColor}
        />
      </svg>
    </div>
  )
}
