import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { anthropic } from "@/lib/anthropic";

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

    const { message, context } = parsed.data;

    const systemPrompt = `You are a certified personal trainer and nutrition coach with 10+ years of experience. Provide evidence-based, practical advice on training, nutrition, recovery, and performance. Always prioritize safety — for any medical, injury, or health condition questions, recommend consulting a licensed healthcare professional. Be direct, specific, and helpful. Keep responses concise (3-5 sentences for simple questions, more for complex ones).`;

    const userContent = context
      ? `User context: ${context}\n\nQuestion: ${message}`
      : message;

    const apiMessage = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 768,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const reply = apiMessage.content[0].type === "text" ? apiMessage.content[0].text : "";

    return NextResponse.json({ success: true, data: { reply } });
  } catch (error) {
    console.error("[api/ai/coach] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
