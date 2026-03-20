import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateCustomer } from "@/lib/stripe";

// POST /api/payments/donate — Create Stripe Checkout Session for donation
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
    const { amount, message, coachId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
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

    // If donating to a coach, get coach name for description
    let coachName = "Gymtality";
    if (coachId) {
      const coach = await prisma.user.findUnique({ where: { id: coachId } });
      if (coach) coachName = coach.fullName;
    }

    const customerId = await getOrCreateCustomer(user.email, user.fullName, userId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation to ${coachName}`,
              description: message || `Supporting ${coachName} on Gymtality`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        coachId: coachId || "",
        message: message || "",
        type: "donation",
      },
      success_url: `${appUrl}/member/donations?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${appUrl}/member/donations?status=cancelled`,
    });

    return NextResponse.json({
      success: true,
      data: { url: session.url, sessionId: session.id },
    });
  } catch (error: any) {
    console.error("POST /api/payments/donate error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create donation session" },
      { status: 500 }
    );
  }
}
