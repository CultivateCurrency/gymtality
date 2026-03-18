import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api";

// GET /api/coach/dashboard — aggregate stats for coach dashboard
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const tenantId = user!.tenantId;
    const coachId = user!.userId;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      planCount,
      clientCount,
      monthlyBookings,
      upcomingEvents,
      recentStreams,
      coachProfile,
    ] = await Promise.all([
      // Workout plans count
      prisma.workoutPlan.count({ where: { coachId, tenantId } }),
      // Unique clients (users with sessions on coach's plans)
      prisma.user.count({
        where: {
          tenantId,
          workoutSessions: { some: { plan: { coachId } } },
        },
      }),
      // This month's paid bookings
      prisma.eventBooking.findMany({
        where: {
          event: { tenantId, coachId, price: { gt: 0 }, startTime: { gte: startOfMonth } },
          status: { in: ["BOOKED", "ATTENDED"] },
        },
        include: { event: { select: { price: true } } },
      }),
      // Next upcoming events
      prisma.event.findMany({
        where: { tenantId, coachId, startTime: { gte: now } },
        orderBy: { startTime: "asc" },
        take: 5,
        include: { _count: { select: { bookings: true } } },
      }),
      // Recent streams
      prisma.stream.findMany({
        where: { tenantId, hostId: coachId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      // Coach profile
      prisma.coachProfile.findUnique({ where: { userId: coachId } }),
    ]);

    const commissionRate = coachProfile?.commissionRate ?? 0.85;
    const monthlyEarnings = monthlyBookings.reduce((sum, b) => sum + b.event.price * commissionRate, 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeClients: clientCount,
          workoutPlans: planCount,
          monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
        },
        upcomingEvents,
        recentStreams,
      },
    });
  } catch (error) {
    console.error("GET /api/coach/dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
