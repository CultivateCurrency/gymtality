import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { name, artist, genre, lyrics, duration, audioUrl, imageUrl, order } = body

    const song = await prisma.song.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(artist !== undefined && { artist }),
        ...(genre !== undefined && { genre }),
        ...(lyrics !== undefined && { lyrics }),
        ...(duration !== undefined && { duration }),
        ...(audioUrl !== undefined && { audioUrl }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ success: true, data: song })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update song' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    await prisma.song.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete song' }, { status: 500 })
  }
}
