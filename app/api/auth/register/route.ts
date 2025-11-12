import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email, password, username } = await req.json()

    // 验证输入
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为 6 位' },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '邮箱或用户名已存在' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
    })

    // 生成 token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
    })

    // 返回用户信息（不包含密码）
    const response = NextResponse.json(
      {
        message: '注册成功',
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    )

    // 设置 cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 天
    })

    return response
  } catch (error: any) {
    console.error('注册错误:', error)
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}

