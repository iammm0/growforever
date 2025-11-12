import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Artwork from '@/models/Artwork'
import { getCurrentUser } from '@/lib/auth'

// 获取当前用户的所有作品
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

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const artworks = await Artwork.find({ artistId: currentUser.userId })
      .populate('artistId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Artwork.countDocuments({ artistId: currentUser.userId })

    return NextResponse.json({
      artworks: artworks.map((artwork) => ({
        id: artwork._id.toString(),
        title: artwork.title,
        description: artwork.description,
        imageUrl: artwork.imageUrl,
        artist: {
          id: (artwork.artistId as any)._id.toString(),
          username: (artwork.artistId as any).username,
          avatar: (artwork.artistId as any).avatar,
        },
        tags: artwork.tags,
        isPublic: artwork.isPublic,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('获取我的作品错误:', error)
    return NextResponse.json(
      { error: '获取作品列表失败' },
      { status: 500 }
    )
  }
}

