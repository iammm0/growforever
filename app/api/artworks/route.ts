import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Artwork from '@/models/Artwork'
import { getCurrentUser } from '@/lib/auth'

// 获取所有公开作品
export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const artistId = searchParams.get('artistId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const query: any = { isPublic: true }

    if (artistId) {
      query.artistId = artistId
    }

    const artworks = await Artwork.find(query)
      .populate('artistId', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Artwork.countDocuments(query)

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
        createdAt: artwork.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('获取作品列表错误:', error)
    return NextResponse.json(
      { error: '获取作品列表失败' },
      { status: 500 }
    )
  }
}

// 创建新作品
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

    const body = await req.json()
    const { title, description, imageUrl, tags, isPublic } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: '标题和图片为必填项' },
        { status: 400 }
      )
    }

    const artwork = await Artwork.create({
      title,
      description,
      imageUrl,
      artistId: currentUser.userId,
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
    })

    const populatedArtwork = await Artwork.findById(artwork._id)
      .populate('artistId', 'username avatar')
      .lean()

    return NextResponse.json(
      {
        message: '作品创建成功',
        artwork: {
          id: populatedArtwork!._id.toString(),
          title: populatedArtwork!.title,
          description: populatedArtwork!.description,
          imageUrl: populatedArtwork!.imageUrl,
          artist: {
            id: (populatedArtwork!.artistId as any)._id.toString(),
            username: (populatedArtwork!.artistId as any).username,
            avatar: (populatedArtwork!.artistId as any).avatar,
          },
          tags: populatedArtwork!.tags,
          isPublic: populatedArtwork!.isPublic,
          createdAt: populatedArtwork!.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('创建作品错误:', error)
    return NextResponse.json(
      { error: '创建作品失败' },
      { status: 500 }
    )
  }
}

