import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { name, title, subTitle, description, coverImage, category } = body

    const album = await prisma.album.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(subTitle !== undefined && { subTitle }),
        ...(description !== undefined && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(category !== undefined && { category }),
      },
    })

    return NextResponse.json({ success: true, data: album })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update album' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    await prisma.album.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete album' }, { status: 500 })
  }
}
