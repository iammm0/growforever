'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Github, User, LogIn, UserPlus, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import ThemeToggle from './theme-toggle'

const Navigation: React.FC = () => {
  const router = useRouter()
  const { actualMode } = useTheme()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const authMenuRef = useRef<HTMLDivElement>(null)
  const isDark = actualMode === 'dark'

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node) &&
        authMenuRef.current &&
        !authMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false)
        setAuthMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNavigate = (path: string) => {
    setUserMenuOpen(false)
    setAuthMenuOpen(false)
    router.push(path)
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  const borderColor = isDark ? 'border-white/10' : 'border-black/10'
  const hoverBg = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
  const textColor = isDark ? 'text-white' : 'text-black'
  const menuBg = isDark ? 'bg-black/80' : 'bg-white/90'

  return (
    <header
      className={`sticky top-0 z-40 border-b ${borderColor} bg-transparent backdrop-blur-xl transition-all duration-300`}
    >
      <div className="flex min-h-14 items-center justify-between px-4 py-2 sm:min-h-16 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open('https://github.com/iammm0/growforever-web.git', '_blank')}
            title="与我一起协作开发该项目！"
            className={`rounded-lg p-2 ${textColor} transition-all hover:scale-110 ${hoverBg}`}
          >
            <Github className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                title="用户菜单"
                className="rounded-full transition-transform hover:scale-105"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 sm:h-9 sm:w-9 ${
                    isDark ? 'border-white/30' : 'border-black/20'
                  } ${textColor} font-semibold`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
              </button>
              {userMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 min-w-[200px] rounded-lg border ${borderColor} ${menuBg} p-1 shadow-xl backdrop-blur-xl`}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate('/profile')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 ${textColor} ${hoverBg}`}
                  >
                    <User className="h-5 w-5" />
                    个人资料
                  </button>
                  <div className={`my-1 h-px ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 ${textColor} ${hoverBg}`}
                  >
                    <LogOut className="h-5 w-5" />
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={authMenuRef}>
              <button
                type="button"
                onClick={() => setAuthMenuOpen(!authMenuOpen)}
                title="登录/注册"
                className={`flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 ${textColor} transition-all hover:scale-105 hover:border-primary hover:bg-primary/20`}
              >
                <User className="h-5 w-5" />
              </button>
              {authMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 min-w-[180px] rounded-lg border ${borderColor} ${menuBg} p-1 shadow-xl backdrop-blur-xl`}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate('/auth/login')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 ${textColor} ${hoverBg}`}
                  >
                    <LogIn className="h-5 w-5" />
                    登录
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('/auth/register')}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 ${textColor} ${hoverBg}`}
                  >
                    <UserPlus className="h-5 w-5" />
                    注册
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navigation
