'use client'

import { Box, Container, Typography, alpha, useTheme } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import GrowHero from '@/components/presentation/grow-hero'
import FeatureCard from '@/components/presentation/feature-card'
import GlobalBackground from '@/components/presentation/global-background'
import { AutoGraph, Search, Share } from '@mui/icons-material'

const features = [
  {
    icon: AutoGraph,
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
    icon: Share,
    title: '多数据库架构',
    description:
      'MongoDB + Neo4j + Qdrant 三重存储，确保数据安全、查询高效、扩展灵活。',
    color: '#06b6d4',
    link: null,
  },
]

export default function Home() {
  const router = useRouter()
  const theme = useTheme()
  const { user } = useAuth()
  const isDark = theme.palette.mode === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const textShadow = isDark ? '0 1px 8px rgba(0, 0, 0, 0.5)' : 'none'

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        zIndex: 1,
      }}
    >
      {/* 全局背景 */}
      <GlobalBackground
        mobilePosDark="center"
        mobilePosLight="center"
        desktopPosDark="center"
        desktopPosLight="center"
        mobileZoom={1.0}
        overlay={true}
      />

      {/* Hero 区域 */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <GrowHero />
      </Box>

      {/* 功能特性区域 */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8, position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 4,
            maxWidth: 1400,
            mx: 'auto',
            px: { xs: 2, sm: 3 },
          }}
        >
          {features.map((feature, idx) => {
            const IconComponent = feature.icon
            return (
              <Box
                key={idx}
                onClick={() => feature.link && router.push(feature.link)}
                sx={{
                  cursor: feature.link ? 'pointer' : 'default',
                }}
              >
                <FeatureCard
                  icon={<IconComponent sx={{ fontSize: 48, color: feature.color }} />}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                />
              </Box>
            )
          })}
        </Box>
      </Container>

      {/* 统计信息区域（可选） */}
      {user && (
        <Container maxWidth="md" sx={{ mt: 8, mb: 8, position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              p: 4,
              borderRadius: 3,
              background: isDark ? alpha('#fff', 0.1) : alpha('#fff', 0.15),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)}`,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 600, color: textColor, textShadow }}
            >
              欢迎回来，{user.username}！
            </Typography>
            <Typography variant="body2" sx={{ color: alpha(textColor, 0.9), textShadow }}>
              继续你的思维之旅
            </Typography>
          </Box>
        </Container>
      )}
    </Box>
  )
}
