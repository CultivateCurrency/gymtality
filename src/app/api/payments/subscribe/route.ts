import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, PLANS, getOrCreateCustomer } from "@/lib/stripe";
import type { PlanKey } from "@/lib/stripe";

// POST /api/payments/subscribe — Create Stripe Checkout Session for subscription
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { plan, interval = "MONTHLY" } = body;

    if (!plan || !PLANS[plan as PlanKey]) {
      return NextResponse.json(
        { success: false, error: "Invalid plan. Choose BASIC, PREMIUM, or ELITE." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const planConfig = PLANS[plan as PlanKey];
    const unitAmount = interval === "YEARLY" ? planConfig.yearlyPrice : planConfig.monthlyPrice;
    const customerId = await getOrCreateCustomer(user.email, user.fullName, userId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${planConfig.name} Plan`,
              description: `Gymtality ${planConfig.name} — ${interval === "YEARLY" ? "Annual" : "Monthly"} subscription`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: interval === "YEARLY" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan,
        interval,
      },
      success_url: `${appUrl}/member/settings?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${appUrl}/member/settings?status=cancelled`,
    });

    return NextResponse.json({
      success: true,
      data: { url: session.url, sessionId: session.id },
    });
  } catch (error: any) {
    console.error("POST /api/payments/subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
