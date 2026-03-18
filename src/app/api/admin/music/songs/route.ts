import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default'
    const { searchParams } = new URL(req.url)
    const albumId = searchParams.get('albumId')

    const songs = await prisma.song.findMany({
      where: {
        ...(albumId ? { albumId } : {}),
        album: { tenantId },
      },
      include: { album: { select: { id: true, name: true } } },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: songs })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { albumId, name, artist, genre, lyrics, duration, audioUrl, imageUrl, order } = body

    if (!albumId || !name || !artist) {
      return NextResponse.json({ success: false, error: 'Album, song name, and artist are required' }, { status: 400 })
    }

    const song = await prisma.song.create({
      data: {
        albumId,
        name,
        artist,
        genre: genre || null,
        lyrics: lyrics || null,
        duration: duration || 0,
        audioUrl: audioUrl || '',
        imageUrl: imageUrl || null,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ success: true, data: song }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create song' }, { status: 500 })
  }
}
