import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, getOrCreateCustomer } from "@/lib/stripe";

// POST /api/payments/checkout — Create Stripe Checkout Session for shop order
export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
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

    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId,
        product: { tenantId },
      },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Verify stock
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for "${item.product.name}"` },
          { status: 400 }
        );
      }
    }

    const customerId = await getOrCreateCustomer(user.email, user.fullName, userId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          description: item.product.description || undefined,
          images: item.product.images?.length ? [item.product.images[0]] : undefined,
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId,
        tenantId,
        type: "shop_order",
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      success_url: `${appUrl}/member/shop?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${appUrl}/member/shop?status=cancelled`,
    });

    return NextResponse.json({
      success: true,
      data: { url: session.url, sessionId: session.id },
    });
  } catch (error: any) {
    console.error("POST /api/payments/checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
