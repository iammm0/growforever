import mongoose, { Schema, Document } from 'mongoose'

export interface IArtwork extends Document {
  title: string
  description?: string
  imageUrl: string
  artistId: mongoose.Types.ObjectId
  tags?: string[]
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const ArtworkSchema = new Schema<IArtwork>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    artistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// 索引
ArtworkSchema.index({ artistId: 1, createdAt: -1 })
ArtworkSchema.index({ isPublic: 1, createdAt: -1 })
ArtworkSchema.index({ tags: 1 })

export default mongoose.models.Artwork || mongoose.model<IArtwork>('Artwork', ArtworkSchema)

