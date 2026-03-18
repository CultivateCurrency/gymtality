import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const body = await req.json()
    const { question, type, options, category, order, active } = body

    const item = await prisma.questionnaire.update({
      where: { id: params.id },
      data: {
        ...(question !== undefined && { question }),
        ...(type !== undefined && { type }),
        ...(options !== undefined && { options }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(active !== undefined && { active }),
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    await prisma.questionnaire.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 })
  }
}
