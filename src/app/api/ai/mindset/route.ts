import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateMindset } from "@/lib/ai";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const schema = z.object({
  mood: z.string().min(1).max(100),
  goal: z.string().min(1).max(200),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
});

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { allowed, retryAfter } = checkRateLimit(`ai-mindset:${auth.userId}`, 20, 60 * 60 * 1000);
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

    const mindset = await generateMindset(parsed.data);

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
          type: "MINDSET",
          input: parsed.data,
          output: mindset,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: mindset });
  } catch (error) {
    console.error("[api/ai/mindset] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
