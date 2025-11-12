import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { message: '登出成功' },
    { status: 200 }
  )

  // 清除 cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  })

  return response
}

