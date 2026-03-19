import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'
    const questions = await prisma.questionnaire.findMany({
      where: { tenantId },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ success: true, data: questions })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch questionnaire' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'
    const body = await req.json()
    const { question, type, options, category, order, active } = body

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question text is required' }, { status: 400 })
    }

    const item = await prisma.questionnaire.create({
      data: {
        tenantId,
        question,
        type: type || 'TEXT',
        options: options || [],
        category: category || 'GENERAL',
        order: order ?? 0,
        active: active !== false,
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 })
  }
}
