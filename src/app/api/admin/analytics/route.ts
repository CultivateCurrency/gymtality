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
