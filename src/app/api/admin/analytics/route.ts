import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newSignupsThisMonth,
      activeUsers,
      totalRevenue,
      subscriptionRevenue,
      topTrainers,
      usersByRole,
      pendingCoaches,
      pendingReports,
    ] = await Promise.all([
      // Total users in tenant
      prisma.user.count({ where: { tenantId } }),

      // New signups this month
      prisma.user.count({
        where: {
          tenantId,
          createdAt: { gte: startOfMonth },
        },
      }),

      // Active users (had a workout session in last 30 days)
      prisma.workoutSession.groupBy({
        by: ["userId"],
        where: {
          user: { tenantId },
          startedAt: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }).then((results) => results.length),

      // Total order revenue
      prisma.order.aggregate({
        where: {
          user: { tenantId },
          status: "PAID",
        },
        _sum: { total: true },
      }),

      // Subscription count by plan
      prisma.subscription.groupBy({
        by: ["plan"],
        where: {
          user: { tenantId },
          status: "ACTIVE",
        },
        _count: true,
      }),

      // Top trainers by session count
      prisma.workoutPlan.findMany({
        where: { tenantId },
        select: {
          coachId: true,
          coach: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePhoto: true,
            },
          },
          _count: {
            select: { sessions: true },
          },
        },
        orderBy: {
          sessions: { _count: "desc" },
        },
        take: 10,
      }),

      // Users by role
      prisma.user.groupBy({
        by: ["role"],
        where: { tenantId },
        _count: true,
      }),

      // Pending coach approvals
      prisma.coachProfile.count({
        where: {
          user: { tenantId },
          approvalStatus: "PENDING",
        },
      }),

      // Pending moderation reports
      prisma.report.count({
        where: {
          reporter: { tenantId },
          status: "PENDING",
        },
      }),
    ]);

    // Monthly revenue (last 6 months)
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthOrders = await prisma.order.aggregate({
        where: {
          user: { tenantId },
          status: "PAID",
          createdAt: { gte: d, lt: end },
        },
        _sum: { total: true },
      });
      monthlyRevenue.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        revenue: monthOrders._sum.total || 0,
      });
    }

    // Daily user activity (last 7 days) — users who logged a workout session
    const dailyActivity: { day: string; users: number }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      const activeCount = await prisma.workoutSession.groupBy({
        by: ["userId"],
        where: {
          user: { tenantId },
          startedAt: { gte: dayStart, lt: dayEnd },
        },
      }).then((r) => r.length);
      dailyActivity.push({
        day: dayNames[dayStart.getDay()],
        users: activeCount,
      });
    }

    // Deduplicate top trainers (group by coach)
    const trainerMap = new Map<string, { coach: any; totalSessions: number }>();
    for (const plan of topTrainers) {
      const existing = trainerMap.get(plan.coachId);
      if (existing) {
        existing.totalSessions += plan._count.sessions;
      } else {
        trainerMap.set(plan.coachId, {
          coach: plan.coach,
          totalSessions: plan._count.sessions,
        });
      }
    }
    const rankedTrainers = Array.from(trainerMap.values())
      .sort((a, b) => b.totalSessions - a.totalSessions)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        newSignupsThisMonth,
        activeUsersLast30Days: activeUsers,
        revenue: {
          totalOrderRevenue: totalRevenue._sum.total || 0,
        },
        subscriptions: subscriptionRevenue,
        topTrainers: rankedTrainers,
        usersByRole,
        pendingCoaches,
        pendingReports,
        monthlyRevenue,
        dailyActivity,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
