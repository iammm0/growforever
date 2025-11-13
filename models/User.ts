import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  username: string
  avatar?: string
  bio?: string
  publicInfo?: {
    displayName?: string
    location?: string
    website?: string
    socialLinks?: {
      twitter?: string
      instagram?: string
      github?: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    publicInfo: {
      displayName: String,
      location: String,
      website: String,
      socialLinks: {
        twitter: String,
        instagram: String,
        github: String,
      },
    },
  },
  {
    timestamps: true,
  }
)

// 注意：email 和 username 字段已经通过 unique: true 自动创建了索引
// 不需要手动再次创建索引，否则会导致重复索引警告

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

