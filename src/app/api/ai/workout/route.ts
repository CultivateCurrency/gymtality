import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateWorkoutPlan } from "@/lib/ai";

export const dynamic = "force-dynamic";

const schema = z.object({
  goal: z.string().min(1).max(200),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  equipment: z.array(z.string()).min(1).max(20),
  durationMins: z.number().int().min(15).max(120),
  focus: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { allowed, retryAfter } = checkRateLimit(`ai-workout:${auth.userId}`, 20, 60 * 60 * 1000);
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

    const plan = await generateWorkoutPlan(parsed.data);

    return NextResponse.json({ success: true, data: { plan } });
  } catch (error) {
    console.error("[api/ai/workout] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
