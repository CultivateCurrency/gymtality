import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import {
  sendOrderConfirmationEmail,
  sendSubscriptionEmail,
  sendDonationReceivedEmail,
} from "@/lib/email";
import type Stripe from "stripe";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// POST /api/payments/webhook — Handle Stripe webhook events
export async function POST(req: NextRequest) {
  const rawBody = await getRawBody(req);
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { success: false, error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // ─── Subscription lifecycle ─────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          await handleSubscriptionCheckout(session);
        } else if (session.mode === "payment") {
          const type = session.metadata?.type;
          if (type === "shop_order") {
            await handleShopCheckout(session);
          } else if (type === "donation") {
            await handleDonationCheckout(session);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;
  const interval = session.metadata?.interval;

  if (!userId || !plan) return;

  const stripeSubId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!stripeSubId) return;

  // Retrieve subscription to get current_period_end
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan as any,
      interval: interval === "YEARLY" ? "YEARLY" : "MONTHLY",
      stripeSubId,
      status: "ACTIVE",
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
    update: {
      plan: plan as any,
      interval: interval === "YEARLY" ? "YEARLY" : "MONTHLY",
      stripeSubId,
      status: "ACTIVE",
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });

  // Send confirmation email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    const planPrices: Record<string, Record<string, string>> = {
      BASIC: { MONTHLY: "$9.99", YEARLY: "$99.90" },
      PREMIUM: { MONTHLY: "$19.99", YEARLY: "$199.90" },
      ELITE: { MONTHLY: "$39.99", YEARLY: "$399.90" },
    };
    const amount = planPrices[plan]?.[interval || "MONTHLY"] || "$0.00";
    sendSubscriptionEmail(
      user.email,
      user.fullName,
      plan,
      amount,
      interval === "YEARLY" ? "year" : "month"
    ).catch((err) => console.error("Subscription email failed:", err));
  }
}

async function handleShopCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tenantId = session.metadata?.tenantId;

  if (!userId) return;

  // Fetch cart items and create the order
  const cartItems = await prisma.cartItem.findMany({
    where: { userId, product: { tenantId: tenantId || undefined } },
    include: { product: true },
  });

  if (cartItems.length === 0) return;

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        total,
        status: "PAID",
        stripePaymentId: session.payment_intent as string,
        shippingAddress: session.shipping_details?.address
          ? JSON.parse(JSON.stringify(session.shipping_details.address))
          : null,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  // Send order confirmation email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    sendOrderConfirmationEmail(
      user.email,
      order.id,
      `$${total.toFixed(2)}`,
      order.items.length
    ).catch((err) => console.error("Order confirmation email failed:", err));
  }
}

async function handleDonationCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const coachId = session.metadata?.coachId;
  const message = session.metadata?.message;

  if (!userId) return;

  const amountTotal = session.amount_total;
  if (!amountTotal) return;

  const donation = await prisma.donation.create({
    data: {
      userId,
      coachId: coachId || null,
      amount: amountTotal / 100,
      stripePaymentId: session.payment_intent as string,
      message: message || null,
    },
  });

  // Notify coach
  if (coachId) {
    const [coach, donor] = await Promise.all([
      prisma.user.findUnique({ where: { id: coachId } }),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);
    if (coach && donor) {
      sendDonationReceivedEmail(
        coach.email,
        coach.fullName,
        donor.fullName,
        `$${donation.amount.toFixed(2)}`,
        message || undefined
      ).catch((err) => console.error("Donation email failed:", err));
    }
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const existing = await prisma.subscription.findFirst({
    where: { stripeSubId: subscription.id },
  });

  if (!existing) return;

  const statusMap: Record<string, string> = {
    active: "ACTIVE",
    past_due: "PAST_DUE",
    canceled: "CANCELLED",
    trialing: "TRIALING",
  };

  await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      status: (statusMap[subscription.status] || "ACTIVE") as any,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const existing = await prisma.subscription.findFirst({
    where: { stripeSubId: subscription.id },
  });

  if (!existing) return;

  await prisma.subscription.update({
    where: { id: existing.id },
    data: { status: "CANCELLED" },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subId =
    typeof invoice.subscription === "string"
      ? invoice.subscription
      : invoice.subscription?.id;

  if (!subId) return;

  const existing = await prisma.subscription.findFirst({
    where: { stripeSubId: subId },
  });

  if (!existing) return;

  await prisma.subscription.update({
    where: { id: existing.id },
    data: { status: "PAST_DUE" },
  });
}
