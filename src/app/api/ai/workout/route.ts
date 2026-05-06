import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { anthropic } from "@/lib/anthropic";

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

    const { goal, level, equipment, durationMins, focus } = parsed.data;

    const systemPrompt = `You are an expert personal trainer and strength coach. Generate structured, safe, and effective workout plans. Format your response in clear markdown with sections for warm-up, main workout (with sets, reps, rest periods), and cool-down. Be specific about weights/intensity based on level. Always prioritize proper form.`;

    const userMessage = `Create a ${durationMins}-minute ${level} workout plan with the following details:
- Goal: ${goal}
- Available equipment: ${equipment.join(", ")}
${focus ? `- Focus area: ${focus}` : ""}

Include: warm-up (5 min), main workout with exercise names, sets, reps, rest periods, and a cool-down (5 min). Add brief form notes for key exercises.`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const plan = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ success: true, data: { plan } });
  } catch (error) {
    console.error("[api/ai/workout] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
