'use client'

import { useEffect, useState } from 'react'
import { Box, Typography, IconButton, Collapse } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import classes from '../../styles/AboutGrowForever.module.css'
import clsx from 'clsx'

const markdownFiles = {
    inspiration: '/content/app/inspiration.md',
    techStack: '/content/app/techStack.md',
    architecture: '/content/app/architecture.md',
    future: '/content/app/future.md',
}

const sections = [
    {
        id: 'inspiration',
        title: '灵感来源',
        short: 'GrowForever 的灵感来自对“人类心理活动能否被人工智能模拟”的探索，旨在重现个体真实的认知世界。',
    },
    {
        id: 'techStack',
        title: '技术栈',
        short: '以 Next.js 15 为核心，搭配 Tailwind CSS、MUI、React Flow 构建前端，后端融合 NLP、GPT 与图神经网络技术。',
    },
    {
        id: 'architecture',
        title: '系统架构',
        short: '采用 GPT+GNN 混合模型架构，结合 Zustand 状态管理与 Neo4j 图数据库，实时解析与还原用户心理结构。',
    },
    {
        id: 'future',
        title: '未来方向',
        short: '致力于 AI 自主心理模拟与创意联想，形成可自我演化的个性化心理生态，打造真正具备“胡思乱想”能力的AI。',
    },
];

export default function MarkdownFeatureSection() {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [markdownContent, setMarkdownContent] = useState<Record<string, string>>({})

    useEffect(() => {
        sections.forEach(({ id }) => {
            const key = id as keyof typeof markdownFiles
            fetch(markdownFiles[key])
                .then((res) => res.text())
                .then((text) =>
                    setMarkdownContent((prev) => ({
                        ...prev,
                        [key]: text,
                    }))
                )
                .catch((err) => console.error(`❌ 加载 ${key}.md 失败`, err))
        })
    }, [])

    const handleToggle = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id))
    }

    return (
        <Box>
            {sections.map(({ id, title, short }) => (
                <div
                    key={id}
                    className={clsx(
                        classes.card,
                        expandedId === id && classes.expanded,
                    )}
                >
                    <div className={classes.header} onClick={() => handleToggle(id)}>
                        <Typography variant="h5" className={classes.title}>
                            {title}
                        </Typography>
                        <Typography className={classes.subtitle}>{short}</Typography>
                        <IconButton size="small" className={classes.icon}>
                            {expandedId === id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </div>

                    <Collapse in={expandedId === id}>
                        <div className={classes.markdown}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdownContent[id] || '⏳ 加载中...'}
                            </ReactMarkdown>
                        </div>
                    </Collapse>
                </div>
            ))}
        </Box>
    )
}