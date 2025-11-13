import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser(req)

    if (!currentUser) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    await connectDB()

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '请选择文件' },
        { status: 400 }
      )
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只能上传图片文件' },
        { status: 400 }
      )
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 5MB' },
        { status: 400 }
      )
    }

    // 将文件转换为 base64（实际项目中应该上传到云存储服务如 AWS S3、Cloudinary 等）
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // 更新用户头像
    // @ts-expect-error - Mongoose type inference issue with TypeScript 5.9
    const user = await User.findByIdAndUpdate(
      currentUser.userId,
      { $set: { avatar: dataUrl } },
      { new: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: '头像上传成功',
      avatar: user.avatar,
    })
  } catch (error: any) {
    console.error('上传头像错误:', error)
    return NextResponse.json(
      { error: '上传头像失败' },
      { status: 500 }
    )
  }
}

