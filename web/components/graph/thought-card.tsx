'use client'

import {Handle, NodeProps, NodeTypes, Position} from 'reactflow'
import { motion } from 'framer-motion'
import React from 'react'
import { Badge } from '@/components/ui'
import styles from '../../styles/grow.module.css'

interface ThoughtCardData {
    title: string
    description?: string
    node_metadata?: {
        tags?: string[]
        highlight?: boolean
    }
    highlight?: boolean
    magnified?: boolean
    expandedText?: string
    role?: string
}

export default function ThoughtCard({ data }: NodeProps<ThoughtCardData>) {
    const highlight = !!data?.highlight
    const magnified = !!data?.magnified

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: magnified ? 1.08 : 1, opacity: 1 }}
            whileHover={{ scale: magnified ? 1.1 : 1.05 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`${styles.thoughtCard} ${highlight ? styles.highlighted : styles.default} ${magnified ? styles.magnified : ''}`}
        >
                <div className={styles.cardContent}>
                    <div className={styles.titleSection}>
                        <h3 className={styles.title}>{data.title || '无标题'}</h3>
                    </div>

                    <div className={styles.tagContainer}>
                        {data?.node_metadata?.tags?.slice(0, 2).map((tag: string) => (
                            <Badge 
                                key={tag} 
                                variant="secondary" 
                                className={styles.tag}
                            >
                                {tag}
                            </Badge>
                        ))}
                        {data?.node_metadata?.tags && data.node_metadata.tags.length > 2 && (
                            <Badge variant="outline" className={styles.moreTag}>
                                +{data.node_metadata.tags.length - 2}
                            </Badge>
                        )}
                    </div>

                    <div className={styles.roleIndicator}>
                        <span className={styles.roleBadge}>
                            {data.role === 'seed' ? '种子' : data.role === 'generated' ? '生成' : '节点'}
                        </span>
                    </div>
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