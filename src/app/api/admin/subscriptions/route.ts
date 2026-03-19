import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const plan = searchParams.get("plan"); // BASIC | PREMIUM | ELITE
    const status = searchParams.get("status"); // ACTIVE | CANCELLED | PAST_DUE | TRIALING

    const where: any = {
      user: { tenantId },
    };

    if (plan) where.plan = plan;
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              profilePhoto: true,
              role: true,
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const { subscriptionId, plan, status, currentPeriodEnd } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { success: false, error: "subscriptionId is required" },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return NextResponse.json(
        { success: false, error: "Subscription not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (plan) {
      if (!["BASIC", "PREMIUM", "ELITE"].includes(plan)) {
        return NextResponse.json(
          { success: false, error: "Invalid plan value" },
          { status: 400 }
        );
      }
      updateData.plan = plan;
    }

    if (status) {
      if (!["ACTIVE", "CANCELLED", "PAST_DUE", "TRIALING"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status value" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (currentPeriodEnd) {
      updateData.currentPeriodEnd = new Date(currentPeriodEnd);
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Notify user about subscription change (non-blocking)
    if (updatedSubscription.user && plan) {
      const planPrices: Record<string, string> = { BASIC: "$9.99", PREMIUM: "$19.99", ELITE: "$39.99" };
      sendSubscriptionEmail(
        updatedSubscription.user.email,
        updatedSubscription.user.fullName,
        plan,
        planPrices[plan] || "$0.00",
        "month"
      ).catch((err) => console.error("Subscription email failed:", err));
    }

    return NextResponse.json({
      success: true,
      data: updatedSubscription,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/subscriptions error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
