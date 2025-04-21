import { Handle, Position, NodeProps } from 'reactflow'
import { motion } from 'framer-motion'

export default function NodeRenderer({ data }: NodeProps) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="p-4 rounded-lg shadow-lg border bg-white text-center"
            style={{ borderColor: data.color, borderWidth: 2 }}
        >
            <div className="text-lg font-bold" style={{ color: data.color }}>
                {data.label}
            </div>
            {data.description && (
                <div className="text-sm text-gray-500">{data.description}</div>
            )}
            <Handle type="source" position={Position.Bottom} />
            <Handle type="target" position={Position.Top} />
        </motion.div>
    )
}
