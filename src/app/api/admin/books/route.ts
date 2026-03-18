import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default'
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const books = await prisma.book.findMany({
      where: {
        tenantId,
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: books })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch books' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default'
    const body = await req.json()
    const { title, author, language, category, subcategory, coverImage, about } = body

    if (!title || !author) {
      return NextResponse.json({ success: false, error: 'Title and author are required' }, { status: 400 })
    }

    const book = await prisma.book.create({
      data: {
        tenantId,
        title,
        author,
        language: language || 'English',
        category: category || 'General',
        subcategory: subcategory || null,
        coverImage: coverImage || null,
        about: about || null,
      },
    })

    return NextResponse.json({ success: true, data: book }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create book' }, { status: 500 })
  }
}
