import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateCustomer } from "@/lib/stripe";

// POST /api/payments/portal — Create Stripe Customer Portal session for subscription management
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const customerId = await getOrCreateCustomer(user.email, user.fullName, userId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/member/settings`,
    });

    return NextResponse.json({
      success: true,
      data: { url: portalSession.url },
    });
  } catch (error: any) {
    console.error("POST /api/payments/portal error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
