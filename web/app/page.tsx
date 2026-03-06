'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import GrowHero from '@/components/presentation/grow-hero'
import FeatureCard from '@/components/presentation/feature-card'
import GlobalBackground from '@/components/presentation/global-background'
import { GitBranch, Search, Database } from 'lucide-react'

const features = [
  {
    icon: GitBranch,
    title: 'AI 文本扩展',
    description:
      '结合大模型生成能力与结构化思维管理，支持改写、续写、摘要等多种模式，打造类人智能认知体验。',
    color: '#8b5cf6',
    link: '/expand',
  },
  {
    icon: Search,
    title: '语义搜索',
    description:
      '基于向量数据库的智能语义搜索，快速找到相关的思维节点，让知识连接更高效。',
    color: '#ec4899',
    link: '/graph',
  },
  {
    icon: Database,
    title: '多数据库架构',
    description:
      'MongoDB + Neo4j + Qdrant 三重存储，确保数据安全、查询高效、扩展灵活。',
    color: '#06b6d4',
    link: null,
  },
]

export default function Home() {
  const router = useRouter()
  const { actualMode } = useTheme()
  const { user } = useAuth()
  const isDark = actualMode === 'dark'
  const textColor = isDark ? 'text-white' : 'text-black'
  const borderColor = isDark ? 'border-white/20' : 'border-black/15'

  return (
    <div className="relative z-10 min-h-screen">
      <GlobalBackground
        mobilePosDark="center"
        mobilePosLight="center"
        desktopPosDark="center"
        desktopPosLight="center"
        mobileZoom={1.0}
        overlay={true}
      />

      <div className="relative z-10">
        <GrowHero />
      </div>

      <div className="relative z-10 mx-auto mt-16 max-w-[1400px] px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon
            return (
              <div
                key={idx}
                onClick={() => feature.link && router.push(feature.link)}
                className={feature.link ? 'cursor-pointer' : 'cursor-default'}
              >
                <FeatureCard
                  icon={<IconComponent className="h-12 w-12" style={{ color: feature.color }} />}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                />
              </div>
            )
          })}
        </div>
      </div>

      {user && (
        <div className="relative z-10 mx-auto mt-16 max-w-2xl px-4 pb-16">
          <div
            className={`rounded-xl border ${borderColor} p-6 text-center backdrop-blur-xl ${
              isDark ? 'bg-white/10' : 'bg-white/15'
            }`}
          >
            <h3 className={`mb-2 font-semibold ${textColor}`}>欢迎回来，{user.username}！</h3>
            <p className={`text-sm opacity-90 ${textColor}`}>继续你的思维之旅</p>
          </div>
        </div>
      )}
    </div>
  )
}
