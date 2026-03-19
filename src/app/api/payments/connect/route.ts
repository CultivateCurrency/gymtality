import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/payments/connect — Create Stripe Connect onboarding link for coaches
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || (userRole !== "COACH" && userRole !== "ADMIN")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { coachProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    let stripeAccountId = user.coachProfile?.stripeAccountId;

    // Create Stripe Connected Account if none exists
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        metadata: { userId },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      await prisma.coachProfile.update({
        where: { userId },
        data: { stripeAccountId },
      });
    }

    // Create Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${appUrl}/coach/earnings?connect=refresh`,
      return_url: `${appUrl}/coach/earnings?connect=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      data: { url: accountLink.url },
    });
  } catch (error: any) {
    console.error("POST /api/payments/connect error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create Stripe Connect link" },
      { status: 500 }
    );
  }
}

// GET /api/payments/connect — Check coach's Stripe Connect status
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId },
    });

    if (!coachProfile?.stripeAccountId) {
      return NextResponse.json({
        success: true,
        data: { connected: false, chargesEnabled: false, payoutsEnabled: false },
      });
    }

    const account = await stripe.accounts.retrieve(coachProfile.stripeAccountId);

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    });
  } catch (error: any) {
    console.error("GET /api/payments/connect error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check Stripe Connect status" },
      { status: 500 }
    );
  }
}
