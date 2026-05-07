import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { coachAssistant } from "@/lib/ai";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const schema = z.object({
  message: z.string().min(1).max(1000),
  goals: z.array(z.string().max(100)).max(10).optional(),
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

    const response = await coachAssistant(parsed.data);

    // Save to backend (fire-and-forget — never fail the request if save fails)
    const accessToken = req.cookies.get("gymtality_at")?.value;
    if (accessToken) {
      fetch(`${BACKEND_URL}/api/ai/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          type: "COACH",
          input: parsed.data,
          output: response,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("[api/ai/coach] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
