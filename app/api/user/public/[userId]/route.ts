import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectDB()

    const { userId } = await params
    // @ts-expect-error - Mongoose type inference issue with TypeScript 5.9
    const user = await User.findById(userId).select(
      'username avatar bio publicInfo createdAt'
    )

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        publicInfo: user.publicInfo,
        createdAt: user.createdAt,
      },
    })
  } catch (error: any) {
    console.error('获取公开信息错误:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

