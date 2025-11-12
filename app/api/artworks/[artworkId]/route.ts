import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Artwork from '@/models/Artwork'
import { getCurrentUser } from '@/lib/auth'

// 获取单个作品
export async function GET(
  req: NextRequest,
  { params }: { params: { artworkId: string } }
) {
  try {
    await connectDB()

    const artwork = await Artwork.findById(params.artworkId)
      .populate('artistId', 'username avatar publicInfo')
      .lean()

    if (!artwork) {
      return NextResponse.json(
        { error: '作品不存在' },
        { status: 404 }
      )
    }

    // 如果作品不是公开的，检查是否是作者本人
    if (!artwork.isPublic) {
      const currentUser = await getCurrentUser(req)
      if (!currentUser || currentUser.userId !== (artwork.artistId as any)._id.toString()) {
        return NextResponse.json(
          { error: '无权访问此作品' },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({
      artwork: {
        id: artwork._id.toString(),
        title: artwork.title,
        description: artwork.description,
        imageUrl: artwork.imageUrl,
        artist: {
          id: (artwork.artistId as any)._id.toString(),
          username: (artwork.artistId as any).username,
          avatar: (artwork.artistId as any).avatar,
          publicInfo: (artwork.artistId as any).publicInfo,
        },
        tags: artwork.tags,
        isPublic: artwork.isPublic,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('获取作品错误:', error)
    return NextResponse.json(
      { error: '获取作品失败' },
      { status: 500 }
    )
  }
}

// 更新作品
export async function PATCH(
  req: NextRequest,
  { params }: { params: { artworkId: string } }
) {
  try {
    const currentUser = await getCurrentUser(req)

    if (!currentUser) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    await connectDB()

    const artwork = await Artwork.findById(params.artworkId)

    if (!artwork) {
      return NextResponse.json(
        { error: '作品不存在' },
        { status: 404 }
      )
    }

    // 检查是否是作者本人
    if (artwork.artistId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: '无权修改此作品' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, imageUrl, tags, isPublic } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (tags !== undefined) updateData.tags = tags
    if (isPublic !== undefined) updateData.isPublic = isPublic

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      params.artworkId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('artistId', 'username avatar')
      .lean()

    return NextResponse.json({
      message: '作品更新成功',
      artwork: {
        id: updatedArtwork!._id.toString(),
        title: updatedArtwork!.title,
        description: updatedArtwork!.description,
        imageUrl: updatedArtwork!.imageUrl,
        artist: {
          id: (updatedArtwork!.artistId as any)._id.toString(),
          username: (updatedArtwork!.artistId as any).username,
          avatar: (updatedArtwork!.artistId as any).avatar,
        },
        tags: updatedArtwork!.tags,
        isPublic: updatedArtwork!.isPublic,
        createdAt: updatedArtwork!.createdAt,
        updatedAt: updatedArtwork!.updatedAt,
      },
    })
  } catch (error: any) {
    console.error('更新作品错误:', error)
    return NextResponse.json(
      { error: '更新作品失败' },
      { status: 500 }
    )
  }
}

// 删除作品
export async function DELETE(
  req: NextRequest,
  { params }: { params: { artworkId: string } }
) {
  try {
    const currentUser = await getCurrentUser(req)

    if (!currentUser) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    await connectDB()

    const artwork = await Artwork.findById(params.artworkId)

    if (!artwork) {
      return NextResponse.json(
        { error: '作品不存在' },
        { status: 404 }
      )
    }

    // 检查是否是作者本人
    if (artwork.artistId.toString() !== currentUser.userId) {
      return NextResponse.json(
        { error: '无权删除此作品' },
        { status: 403 }
      )
    }

    await Artwork.findByIdAndDelete(params.artworkId)

    return NextResponse.json({
      message: '作品删除成功',
    })
  } catch (error: any) {
    console.error('删除作品错误:', error)
    return NextResponse.json(
      { error: '删除作品失败' },
      { status: 500 }
    )
  }
}

