'use client'

import { Handle, NodeProps, Position } from 'reactflow'
import { motion } from 'framer-motion'
import React from 'react'
import styles from '../../styles/Grow.module.css'

export default function ThoughtCard({ data }: NodeProps) {
    const highlight = !!data?.highlight

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`${styles.card} ${highlight ? styles.highlighted : styles.default}`}
        >
            <div className={styles.title}>{data.title || '无标题'}</div>

            <div className={styles.summary}>{data.summary || '无描述内容'}</div>

            <div className={styles.tagContainer}>
                {data?.tags?.map((tag: string) => (
                    <span key={tag} className={styles.tag}>
                        #{tag}
                    </span>
                ))}
            </div>

            <Handle type="target" position={Position.Top} className={styles.handle} />
            <Handle type="source" position={Position.Bottom} className={styles.handle} />
        </motion.div>
    )
}
