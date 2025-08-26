'use client'

import { Box } from '@mui/material'
import GrowHero from '../components/app/GrowHero'
import FeatureCard from '../components/app/FeatureCard'
import { useTheme } from '@mui/system'
import TornEdge from '../components/app/TornEdge'
import styles from '../styles/Grow.module.css'

const features = [
  { title: '从一个想法开始', description: '每一次点击，都是一颗思维的种子——GrowForever 自动为你展开思维的枝叶。' },
  { title: '多维连接', description: '探索一个事物与多个领域的交汇点，让复杂变清晰。' },
  { title: '自由 · 狂暴 · 手动 三种模式', description: '模拟你的思维节奏，从结构思维到爆发式脑暴自由切换。' },
  { title: '面向未来的认知系统', description: 'GrowForever 是一个用于「观察思维」「理解知识」「组织认知」的 AI 工具。' },
  { title: '实时视觉反馈', description: '每个节点都是认知的一部分，实时可视化让你的思考路径清晰可见。' },
  { title: '融合 AI 与结构化思维', description: '结合大模型生成能力与图结构管理，打造类人智能认知体验。' },
]

export default function Home() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box className={styles.page}>
      {/* 顶部 Hero 背景：增加渐变遮罩，提升可读性 */}
      <Box
        sx={{
          position: 'relative',
          ...(isDark
            ? {
                backgroundImage: 'url(/background/background-dark.jpg)',
              }
            : {
                backgroundImage: 'url(/background/background-light.jpg)',
              }),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          // 移动端避免背景滚动卡顿
          '@media (max-width: 768px)': {
            backgroundAttachment: 'scroll',
          },
          // 叠加一个从顶部到底部的透明黑/白渐变，避免文字被背景干扰
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              isDark
                ? 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.15) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.25) 40%, rgba(255,255,255,0.1) 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* 内容必须在渐变之上 */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <GrowHero />
        </Box>
      </Box>

      {/* Feature 列表 */}
      <Box className={styles.featureCardSection}>
        <Box className={styles.cardGrid}>
          {features.map((f, idx) => (
            <FeatureCard key={idx} title={f.title} description={f.description} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
