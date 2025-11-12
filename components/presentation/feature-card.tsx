'use client'

import { Card, Typography, Box, useTheme, alpha } from '@mui/material'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  icon?: ReactNode
  title: string
  description: string
  color?: string
}

export default function FeatureCard({
  icon,
  title,
  description,
  color = '#22c55e',
}: FeatureCardProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? alpha('#fff', 0.2) : alpha('#000', 0.15)
  const bgColor = isDark ? alpha('#fff', 0.1) : alpha('#fff', 0.15)
  const textShadow = isDark ? '0 1px 8px rgba(0, 0, 0, 0.5)' : 'none'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Card
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 4,
          borderRadius: 4,
          border: `1px solid ${borderColor}`,
          background: bgColor,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(color, 0.2)} 0%, transparent 70%)`,
            opacity: 0,
            transition: 'opacity 0.4s ease',
          },
          '&:hover': {
            borderColor: color,
            boxShadow: `0 20px 40px ${alpha(color, 0.3)}, 0 0 0 1px ${alpha(color, 0.2)}`,
            transform: 'translateY(-8px)',
            background: isDark ? alpha('#fff', 0.15) : alpha('#fff', 0.2),
            '&::before': {
              transform: 'scaleX(1)',
            },
            '&::after': {
              opacity: 1,
            },
          },
        }}
      >
        {/* 图标容器 */}
        {icon && (
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 3,
              background: alpha(color, 0.2),
              border: `1px solid ${alpha(color, 0.3)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, transparent 100%)`,
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': {
                opacity: 1,
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          </Box>
        )}

        {/* 标题 */}
        <Typography
          variant="h5"
          fontWeight={700}
          mb={2}
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            lineHeight: 1.3,
            color: textColor,
            textShadow,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>

        {/* 描述 */}
        <Typography
          variant="body1"
          sx={{
            lineHeight: 1.8,
            flex: 1,
            fontSize: { xs: '0.9rem', sm: '1rem' },
            color: alpha(textColor, 0.9),
            textShadow,
          }}
        >
          {description}
        </Typography>

        {/* 底部装饰线 */}
        <Box
          sx={{
            mt: 3,
            height: '2px',
            width: '40px',
            background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
            borderRadius: 1,
            opacity: 0.7,
          }}
        />
      </Card>
    </motion.div>
  )
}
