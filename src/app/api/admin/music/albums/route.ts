import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default'

    const albums = await prisma.album.findMany({
      where: { tenantId },
      include: { _count: { select: { songs: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: albums })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch albums' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default'
    const body = await req.json()
    const { name, title, subTitle, description, coverImage, category } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Album name is required' }, { status: 400 })
    }

    const album = await prisma.album.create({
      data: {
        tenantId,
        name,
        title: title || null,
        subTitle: subTitle || null,
        description: description || null,
        coverImage: coverImage || null,
        category: category || null,
      },
    })

    return NextResponse.json({ success: true, data: album }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create album' }, { status: 500 })
  }
}
