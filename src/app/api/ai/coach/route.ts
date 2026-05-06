import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateCoachReply } from "@/lib/ai";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(1000),
  context: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { allowed, retryAfter } = checkRateLimit(`ai-coach:${auth.userId}`, 30, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Try again later." },
        { status: 429, headers: retryAfter ? { "Retry-After": String(retryAfter) } : {} }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const reply = await generateCoachReply(parsed.data);

    return NextResponse.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("[api/ai/coach] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
