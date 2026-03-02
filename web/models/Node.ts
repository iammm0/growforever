import mongoose, { Schema, Document, Types } from 'mongoose'
import { NodeType } from './Seed'

export interface INode extends Document {
  seedId: Types.ObjectId
  parentId?: Types.ObjectId
  title: string
  description?: string
  type: NodeType
  content?: any
  nodeMetadata?: any
  createdAt: Date
  updatedAt: Date
}

const NodeSchema = new Schema<INode>(
  {
    seedId: {
      type: Schema.Types.ObjectId,
      ref: 'Seed',
      required: true,
      index: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Node',
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: Object.values(NodeType),
      default: NodeType.IDEA,
    },
    content: {
      type: Schema.Types.Mixed,
    },
    nodeMetadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Node || mongoose.model<INode>('Node', NodeSchema)

