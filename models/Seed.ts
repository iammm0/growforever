import mongoose, { Schema, Document } from 'mongoose'

export enum NodeType {
  IDEA = 'IDEA',
  MEMORY = 'MEMORY',
  EMOTION = 'EMOTION',
  FEATURE = 'FEATURE',
  EVENT = 'EVENT',
  USER_DEFINED = 'USER_DEFINED',
}

export enum EdgeType {
  RELATION = 'RELATION',
  CAUSAL = 'CAUSAL',
  SEQUENTIAL = 'SEQUENTIAL',
  ASSOCIATION = 'ASSOCIATION',
  USER_DEFINED = 'USER_DEFINED',
}

export interface ISeed extends Document {
  title: string
  description?: string
  createdAt: Date
}

const SeedSchema = new Schema<ISeed>(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
)

export default mongoose.models.Seed || mongoose.model<ISeed>('Seed', SeedSchema)

