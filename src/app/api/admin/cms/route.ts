import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

const CMS_KEYS = ['about', 'terms_user', 'terms_pro', 'privacy']
const CMS_TITLES: Record<string, string> = {
  about: 'About Us',
  terms_user: 'Terms & Conditions (User Sign Up)',
  terms_pro: 'Terms & Conditions (Professional Sign Up)',
  privacy: 'Privacy Policy',
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'
    const { searchParams } = new URL(req.url)
    const key = searchParams.get('key')

    if (key) {
      let page = await prisma.cmsPage.findUnique({ where: { tenantId_key: { tenantId, key } } })
      if (!page) {
        page = { id: '', tenantId, key, title: CMS_TITLES[key] || key, content: '', updatedAt: new Date() }
      }
      return NextResponse.json({ success: true, data: page })
    }

    // Return all CMS pages
    const pages = await Promise.all(
      CMS_KEYS.map(async (k) => {
        const page = await prisma.cmsPage.findUnique({ where: { tenantId_key: { tenantId, key: k } } })
        return page || { id: '', tenantId, key: k, title: CMS_TITLES[k], content: '', updatedAt: new Date() }
      })
    )

    return NextResponse.json({ success: true, data: pages })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch CMS pages' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'
    const body = await req.json()
    const { key, content } = body

    if (!key || !CMS_KEYS.includes(key)) {
      return NextResponse.json({ success: false, error: 'Invalid CMS key' }, { status: 400 })
    }

    const page = await prisma.cmsPage.upsert({
      where: { tenantId_key: { tenantId, key } },
      update: { content: content || '' },
      create: {
        tenantId,
        key,
        title: CMS_TITLES[key] || key,
        content: content || '',
      },
    })

    return NextResponse.json({ success: true, data: page })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to save CMS page' }, { status: 500 })
  }
}
