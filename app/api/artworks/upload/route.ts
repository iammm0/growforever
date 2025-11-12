import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
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

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      )
    }

    // 将文件转换为 base64（实际项目中应该上传到云存储服务）
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      message: '图片上传成功',
      imageUrl: dataUrl,
    })
  } catch (error: any) {
    console.error('上传图片错误:', error)
    return NextResponse.json(
      { error: '上传图片失败' },
      { status: 500 }
    )
  }
}

