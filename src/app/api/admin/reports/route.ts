import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/api'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['ADMIN', 'OWNER', 'SUPER_ADMIN'])
    if (auth instanceof NextResponse) return auth

    const tenantId = req.headers.get('x-tenant-id') || 'default-tenant'
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'overview'

    if (type === 'users') {
      // Users registered over time (last 12 months)
      const now = new Date()
      const months = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return { year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) }
      }).reverse()

      const userCounts = await Promise.all(
        months.map(async ({ year, month }) => {
          const start = new Date(year, month - 1, 1)
          const end = new Date(year, month, 1)
          const count = await prisma.user.count({
            where: { tenantId, createdAt: { gte: start, lt: end } },
          })
          return { label: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`, count }
        })
      )

      const total = await prisma.user.count({ where: { tenantId } })
      return NextResponse.json({ success: true, data: { monthly: userCounts, total } })
    }

    if (type === 'earnings') {
      const now = new Date()
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        return { year: d.getFullYear(), month: d.getMonth() + 1 }
      }).reverse()

      const earnings = await Promise.all(
        months.map(async ({ year, month }) => {
          const start = new Date(year, month - 1, 1)
          const end = new Date(year, month, 1)
          const result = await prisma.order.aggregate({
            where: { user: { tenantId }, status: 'PAID', createdAt: { gte: start, lt: end } },
            _sum: { total: true },
          })
          const label = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`
          return { label, amount: result._sum.total || 0 }
        })
      )

      const totalRevenue = await prisma.order.aggregate({
        where: { user: { tenantId }, status: 'PAID' },
        _sum: { total: true },
      })

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthRevenue = await prisma.order.aggregate({
        where: { user: { tenantId }, status: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      })

      return NextResponse.json({
        success: true,
        data: {
          monthly: earnings,
          totalRevenue: totalRevenue._sum.total || 0,
          monthRevenue: monthRevenue._sum.total || 0,
        },
      })
    }

    if (type === 'activity') {
      // Recent activity: new users, orders, subscriptions
      const limit = 30
      const [recentUsers, recentOrders, recentSubs] = await Promise.all([
        prisma.user.findMany({
          where: { tenantId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: { id: true, fullName: true, email: true, role: true, createdAt: true },
        }),
        prisma.order.findMany({
          where: { user: { tenantId } },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: { user: { select: { fullName: true, email: true } } },
        }),
        prisma.subscription.findMany({
          where: { user: { tenantId } },
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: { user: { select: { fullName: true, email: true } } },
        }),
      ])

      return NextResponse.json({ success: true, data: { recentUsers, recentOrders, recentSubs } })
    }

    // Default overview
    const [totalUsers, totalOrders, totalRevenue, activeSubs] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.order.count({ where: { user: { tenantId } } }),
      prisma.order.aggregate({ where: { user: { tenantId }, status: 'PAID' }, _sum: { total: true } }),
      prisma.subscription.count({ where: { user: { tenantId }, status: 'ACTIVE' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        activeSubs,
      },
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 })
  }
}
