import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'

    const categories = await prisma.category.findMany({
      where: { tenantId, parentId: null },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'
    const body = await req.json()
    const { name, description, icon, parentId, order } = body

    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

    const category = await prisma.category.create({
      data: {
        tenantId,
        name,
        slug,
        description: description || null,
        icon: icon || null,
        parentId: parentId || null,
        order: order ?? 0,
      },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 })
  }
}
