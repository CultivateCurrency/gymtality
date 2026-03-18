import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { title, author, language, category, subcategory, coverImage, about } = body

    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(author !== undefined && { author }),
        ...(language !== undefined && { language }),
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(coverImage !== undefined && { coverImage }),
        ...(about !== undefined && { about }),
      },
    })

    return NextResponse.json({ success: true, data: book })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update book' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    await prisma.book.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete book' }, { status: 500 })
  }
}
