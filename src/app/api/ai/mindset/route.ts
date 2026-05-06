import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { anthropic } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const schema = z.object({
  mood: z.string().min(1).max(100),
  challenge: z.string().max(300).optional(),
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

    const { mood, challenge } = parsed.data;

    const systemPrompt = `You are a sports psychologist and mindset coach specializing in athletic performance and personal growth. Provide warm, direct, actionable coaching that acknowledges feelings without being dismissive, then pivots to practical mental strategies. Keep responses to 2-3 focused paragraphs. Never be preachy or generic.`;

    const userMessage = `My current mood/mental state: ${mood}${challenge ? `\nCurrent challenge: ${challenge}` : ""}

Please give me targeted mindset coaching for today's training.`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const coaching = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ success: true, data: { coaching } });
  } catch (error) {
    console.error("[api/ai/mindset] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
