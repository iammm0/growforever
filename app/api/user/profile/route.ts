import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req)

    if (!currentUser) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    await connectDB()

    const user = await User.findById(currentUser.userId).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        publicInfo: user.publicInfo,
      },
    })
  } catch (error: any) {
    console.error('获取用户资料错误:', error)
    return NextResponse.json(
      { error: '获取用户资料失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req)

    if (!currentUser) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    await connectDB()

    const body = await req.json()
    const { username, bio, avatar, publicInfo } = body

    const updateData: any = {}

    if (username !== undefined) {
      // 检查用户名是否已被使用
      const existingUser = await User.findOne({
        username,
        _id: { $ne: currentUser.userId },
      })
      if (existingUser) {
        return NextResponse.json(
          { error: '用户名已被使用' },
          { status: 400 }
        )
      }
      updateData.username = username
    }

    if (bio !== undefined) {
      updateData.bio = bio
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar
    }

    if (publicInfo !== undefined) {
      updateData.publicInfo = publicInfo
    }

    const user = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '更新成功',
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        publicInfo: user.publicInfo,
      },
    })
  } catch (error: any) {
    console.error('更新用户资料错误:', error)
    return NextResponse.json(
      { error: '更新用户资料失败' },
      { status: 500 }
    )
  }
}

