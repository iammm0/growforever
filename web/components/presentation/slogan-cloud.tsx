'use client'

import React from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

const SloganCloud = () => {
  const isMobile = useMediaQuery('(max-width: 600px)')

  return (
    <div className={`px-6 py-8 text-center ${isMobile ? 'px-4 py-6' : ''}`}>
      <h1 className={`mb-4 font-bold text-secondary ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
        从一念出发，筛选最有价值的创造
      </h1>
      <h2 className={`mb-4 font-bold text-secondary ${isMobile ? 'text-xl' : 'text-3xl'}`}>
        接下来请使用高级功法来解构你的心灵奇旅
      </h2>
      <h3 className={`mb-4 font-bold text-secondary ${isMobile ? 'text-lg' : 'text-2xl'}`}>
        为了让每一个有趣的点子不再被遗忘
      </h3>
      <p className={`mb-4 font-medium text-secondary ${isMobile ? 'text-base' : 'text-xl'}`}>
        探索从一个点子出发所发散出的所有可能性
      </p>
      <p className={`font-medium text-secondary ${isMobile ? 'text-base' : 'text-xl'}`}>
        GrowForever 帮助你从无数延展出的点子中，找出最具创造力与可行性的那个
      </p>
    </div>
  )
}

export default SloganCloud
