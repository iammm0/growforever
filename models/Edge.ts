import mongoose, { Schema, Document, Types } from 'mongoose'
import { EdgeType } from './Seed'

export interface IEdge extends Document {
  sourceId: Types.ObjectId
  targetId: Types.ObjectId
  type: EdgeType
  label?: string
  properties?: any
  createdAt: Date
  updatedAt: Date
}

const EdgeSchema = new Schema<IEdge>(
  {
    sourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Node',
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'Node',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(EdgeType),
      default: EdgeType.RELATION,
    },
    label: {
      type: String,
      maxlength: 255,
    },
    properties: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Edge || mongoose.model<IEdge>('Edge', EdgeSchema)

