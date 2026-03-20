import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api";

// GET /api/coach/earnings — get coach's earnings from paid events and streams
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const tenantId = user!.tenantId;
    const coachId = user!.userId;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Get coach profile for commission rate
    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: coachId },
    });
    const commissionRate = coachProfile?.commissionRate ?? 0.85; // 85% to coach by default

    // Get paid event bookings for this coach's events
    const [bookings, totalBookings] = await Promise.all([
      prisma.eventBooking.findMany({
        where: {
          event: {
            tenantId,
            coachId,
            price: { gt: 0 },
          },
          status: { in: ["BOOKED", "ATTENDED"] },
        },
        include: {
          event: { select: { title: true, price: true, startTime: true, type: true } },
          user: { select: { fullName: true } },
        },
        orderBy: { bookedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.eventBooking.count({
        where: {
          event: { tenantId, coachId, price: { gt: 0 } },
          status: { in: ["BOOKED", "ATTENDED"] },
        },
      }),
    ]);

    // Calculate totals
    const allPaidBookings = await prisma.eventBooking.findMany({
      where: {
        event: { tenantId, coachId, price: { gt: 0 } },
        status: { in: ["BOOKED", "ATTENDED"] },
      },
      include: { event: { select: { price: true, startTime: true } } },
    });

    const totalGross = allPaidBookings.reduce((sum, b) => sum + b.event.price, 0);
    const totalNet = totalGross * commissionRate;

    // This month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthBookings = allPaidBookings.filter(
      (b) => b.event.startTime >= startOfMonth
    );
    const monthlyGross = thisMonthBookings.reduce((sum, b) => sum + b.event.price, 0);
    const monthlyNet = monthlyGross * commissionRate;

    // Monthly earnings breakdown (last 6 months)
    const monthlyEarnings: { month: string; sessions: number; classes: number; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthBookings = allPaidBookings.filter(
        (b) => b.event.startTime >= d && b.event.startTime < end
      );
      const sessionsRev = monthBookings
        .filter((b) => b.event.startTime !== undefined)
        .reduce((s, b) => s + b.event.price, 0);
      monthlyEarnings.push({
        month: d.toLocaleString("en-US", { month: "short" }),
        sessions: Math.round(sessionsRev * commissionRate * 100) / 100,
        classes: 0,
        total: Math.round(sessionsRev * commissionRate * 100) / 100,
      });
    }

    // Format transactions
    const transactions = bookings.map((b) => ({
      id: b.id,
      description: `${b.event.type === "LIVE_CLASS" ? "Live Class" : "Event"} - ${b.event.title} (${b.user.fullName})`,
      gross: b.event.price,
      net: Math.round(b.event.price * commissionRate * 100) / 100,
      date: b.bookedAt,
      status: b.status === "ATTENDED" ? "Completed" : "Pending",
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalGross: Math.round(totalGross * 100) / 100,
          totalNet: Math.round(totalNet * 100) / 100,
          monthlyGross: Math.round(monthlyGross * 100) / 100,
          monthlyNet: Math.round(monthlyNet * 100) / 100,
          commissionRate,
          totalTransactions: totalBookings,
        },
        monthlyEarnings,
        transactions,
        pagination: {
          page,
          limit,
          total: totalBookings,
          totalPages: Math.ceil(totalBookings / limit),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/coach/earnings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
