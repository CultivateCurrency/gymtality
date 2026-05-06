import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Force dynamic — must never be statically cached
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  // ── 1. Read raw body ─────────────────────────────────────────────────────
  // Must capture before any other parsing — Stripe signature verification
  // requires the exact bytes Stripe sent.
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error(
      "[stripe/webhook] Configuration error: " +
      "STRIPE_WEBHOOK_SECRET env var or stripe-signature header is missing"
    );
    return NextResponse.json({ error: "Webhook misconfigured" }, { status: 400 });
  }

  // ── 2. Verify Stripe signature ───────────────────────────────────────────
  // Rejects replayed, tampered, or spoofed events before touching the DB.
  // constructEvent throws if the signature is invalid.
  try {
    getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err: any) {
    console.error(`[stripe/webhook] Signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── 3. Forward verified request to backend ───────────────────────────────
  // The backend at BACKEND_URL handles the DB operations for each event type:
  //   • checkout.session.completed  → upsert Subscription record (ACTIVE)
  //   • invoice.payment_succeeded   → set status ACTIVE, refresh period end
  //   • customer.subscription.deleted → set status CANCELLED
  //
  // Raw body + original stripe-signature are forwarded so the backend can
  // perform its own signature verification (defense in depth).
  //
  // The forwarding runs in the background — we ack Stripe immediately after
  // the signature check to stay well within its 30-second timeout.
  forwardToBackend(rawBody, sig).catch((err) =>
    console.error("[stripe/webhook] Failed to forward event to backend:", err)
  );

  // ── 4. Acknowledge immediately ───────────────────────────────────────────
  return NextResponse.json({ received: true });
}

async function forwardToBackend(rawBody: string, sig: string): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      // Forward the original Stripe signature so the backend can re-verify
      "stripe-signature": sig,
      // Internal secret prevents unauthorized calls to the backend webhook route
      "x-internal-secret": process.env.INTERNAL_WEBHOOK_SECRET ?? "",
    },
    body: rawBody,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    console.error(
      `[stripe/webhook] Backend returned ${res.status} for webhook event: ${text}`
    );
  } else {
    console.log(`[stripe/webhook] Event successfully forwarded to backend (${res.status})`);
  }
}
