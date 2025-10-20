'use client'

import {Handle, NodeProps, NodeTypes, Position} from 'reactflow'
import { motion } from 'framer-motion'
import React from 'react'
import styles from '../../styles/grow.module.css'

export default function ThoughtCard({ data }: NodeProps) {
    const highlight = !!data?.highlight
    const magnified = !!data?.magnified

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: magnified ? 1.08 : 1, opacity: 1 }}
            whileHover={{ scale: magnified ? 1.1 : 1.03 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`${styles.card} ${highlight ? styles.highlighted : styles.default} ${magnified ? styles.magnified : ''}`}
        >
            <div className={styles.title}>{data.title || '无标题'}</div>

            <div className={styles.summary}>{data.description || '无描述内容'}</div>

            <div className={styles.tagContainer}>
                {data?.node_metadata?.tags?.map((tag: string) => (
                    <span key={tag} className={styles.tag}>
                        #{tag}
                    </span>
                ))}
            </div>

            <Handle type="target" position={Position.Top} className={styles.handle} />
            <Handle type="source" position={Position.Bottom} className={styles.handle} />
            <Handle type="target" position={Position.Left} className={styles.handle} />
            <Handle type="source" position={Position.Right} className={styles.handle} />
        </motion.div>
    )
}

export const nodeTypes: NodeTypes = {
    thought: ThoughtCard,
}