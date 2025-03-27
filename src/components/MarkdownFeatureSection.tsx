'use client'

import { useEffect, useState } from "react"
import { Box, Typography, Paper, IconButton, Collapse } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import classes from '../styles/AboutGrowForever.module.css'
import {clsx} from "clsx";

const markdownFiles = {
    inspiration: "/content/app/inspiration.md",
    techStack: "/content/app/techStack.md",
    architecture: "/content/app/architecture.md",
    future: "/content/app/future.md",
}

const sections = [
    {
        id: "inspiration",
        title: "🌱 灵感来源",
        short: "源自对认知过程结构化的思考，GrowForever 想解决“我们到底如何思考？”这个问题。",
    },
    {
        id: "techStack",
        title: "🧪 技术栈",
        short: "使用 Next.js + React + TailwindCSS + React Flow 构建，融合 NLP 与数据可视化技术。",
    },
    {
        id: "architecture",
        title: "🏗️ 架构设计",
        short: "基于模块化组件 + 状态管理（Zustand），数据结构高度解耦，支持思维节点自由生长。",
    },
    {
        id: "future",
        title: "🚀 未来方向",
        short: "将接入 AI 模型自动扩展、认知地图协同编辑、跨领域知识联想等功能，构建认知生态。",
    },
]


export default function MarkdownFeatureSection() {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [markdownContent, setMarkdownContent] = useState<Record<string, string>>({})

    useEffect(() => {
        sections.forEach(({ id }) => {
            const key = id as keyof typeof markdownFiles;
            fetch(markdownFiles[key])
                .then((res) => res.text())
                .then((text) =>
                    setMarkdownContent((prev) => ({
                        ...prev,
                        [key]: text,
                    }))
                )
                .catch((err) => console.error(`❌ 加载 ${key}.md 失败`, err));
        });
    }, []);


    const handleToggle = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id))
    }

    return (
        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {sections.map(({ id, title, short }) => (
                <div key={id} className={clsx(classes.card, expandedId === id && classes.cardExpanded)}>
                    <div className={classes.header} onClick={() => handleToggle(id)}>
                        <div>
                            <Typography variant="h4" className={classes.title}>
                                {title}
                            </Typography>
                            <Typography className={classes.subtitle}>{short}</Typography>
                        </div>
                        <IconButton className={classes.icon}>
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
