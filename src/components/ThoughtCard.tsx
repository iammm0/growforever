'use client'

import type { NodeProps } from 'reactflow'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'
import React from 'react'
import {clsx} from "clsx";

export default function ThoughtCard({data}: NodeProps<any>) {
    return (
        <motion.div
            initial={{scale: 0.8, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            whileHover={{scale: 1.03}}
            transition={{type: 'spring', stiffness: 260, damping: 20}}
            className={clsx(
                'p-4 rounded-xl shadow-lg border w-52 cursor-pointer select-none transition',
                {
                    'border-black bg-white': !data.highlight,
                    'border-green-500 bg-green-50': data.highlight,
                }
            )}
        >
            <div className="text-lg font-bold mb-1" style={{color: data.color}}>
                {data.title || '标题缺失'}
            </div>
            <div className="text-sm text-gray-500 mb-2">
                {data.summary || '无描述'}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
                {data?.tags?.map((tag: string) => (
                    <span
                        key={tag}
                        className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                    >
            #{tag}
          </span>
                ))}
            </div>

            {/* 输入 / 输出连接点 */}
            <Handle type="target" position={Position.Top} className="w-2 h-2 bg-black"/>
            <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-black"/>
        </motion.div>
    )
}

