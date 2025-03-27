'use client'

import { Handle, NodeProps, Position } from 'reactflow'
import { motion } from 'framer-motion'
import React from 'react'
import { clsx } from 'clsx'

export default function ThoughtCard({ data}: NodeProps) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={clsx(
                'p-4 rounded-xl border w-64 cursor-pointer select-none shadow transition-colors duration-200',
                {
                    'bg-white text-black border-black': !data.highlight,
                    'bg-green-50 text-black border-green-500': data.highlight,
                }
            )}
        >
            {/* 标题 */}
            <div className="text-lg font-bold mb-1">{data.title || '无标题'}</div>

            {/* 摘要 */}
            <div className="text-sm text-gray-600 mb-2">
                {data.summary || '无描述内容'}
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1 mt-2">
                {data?.tags?.map((tag: string) => (
                    <span
                        key={tag}
                        className="bg-black text-white text-xs px-2 py-0.5 rounded-full"
                    >
            #{tag}
          </span>
                ))}
            </div>

            {/* 节点连接口 */}
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-black" />
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-black" />
        </motion.div>
    )
}
