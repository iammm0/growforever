'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import { Button } from '@/components/ui/button'

export default function GrowHero() {
  const router = useRouter()
  const { actualMode } = useTheme()
  const { user } = useAuth()
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/30' : 'border-black/30'

  return (
    <div className="relative overflow-hidden text-center">
      <div className="relative z-10 mx-auto max-w-[960px] px-5 py-14 md:py-20">
        <h1
          className={`mb-4 font-[1000] leading-[0.95] tracking-tight ${textColor}`}
          style={{
            fontFamily: '"Orbitron", system-ui, sans-serif',
            fontSize: 'clamp(3rem, 9.5vw, 9.5rem)',
            letterSpacing: '-0.02em',
            textShadow: isDark ? '0 4px 30px rgba(0,0,0,0.6), 0 0 20px rgba(34,197,94,0.5)' : '0 2px 10px rgba(0,0,0,0.2)',
          }}
        >
          GrowForever
        </h1>

        <p className={`mb-1 block font-semibold md:hidden ${textColor}`} style={{ fontSize: 'clamp(1.25rem, 5vw, 1.5rem)' }}>
          永恒之森
        </p>

        <p className={`mb-1 text-base opacity-95 sm:text-xl ${textColor}`}>模糊意味着复杂，精确意味着简单。</p>
        <p className={`mb-8 text-sm opacity-85 sm:text-base ${textColor}`}>
          Ambiguity breeds difficulty; Precision fosters simplicity.
        </p>

        <div className="mx-auto flex max-w-[600px] flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
          <Button
            variant="grow"
            size="lg"
            onClick={() => router.push('/graph')}
            className="min-w-full px-6 py-6 text-base font-semibold sm:min-w-0"
          >
            开始播种想法
          </Button>
          {!user && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/auth/register')}
              className={`min-w-full border-2 px-6 py-6 text-base font-semibold sm:min-w-0 ${borderColor} ${textColor} backdrop-blur-sm ${
                isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
              }`}
            >
              注册账号
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
