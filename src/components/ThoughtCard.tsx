import { Handle, NodeProps, Position } from 'reactflow'
import { motion } from 'framer-motion'
import React from 'react'

export default function ThoughtCard({ data }: NodeProps<any>) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-xl shadow-lg border bg-white w-52 cursor-pointer select-none"
            style={{ borderColor: data.color || '#4ade80', borderWidth: 2 }}
        >
            <div className="text-lg font-bold mb-1" style={{ color: data.color }}>
                {data.title}
            </div>
            <div className="text-sm text-gray-500 mb-2">{data.summary}</div>
            <div className="flex flex-wrap gap-1 mt-2">
                {data.tags?.map((tag: string) => (
                    <span
                        key={tag}
                        className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full"
                    >
            #{tag}
          </span>
                ))}
            </div>
            <Handle type="source" position={Position.Bottom} />
            <Handle type="target" position={Position.Top} />
        </motion.div>
    )
}
