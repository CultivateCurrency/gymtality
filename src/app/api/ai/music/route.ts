import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { anthropic } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const schema = z.object({
  workoutType: z.string().min(1).max(100),
  tempo: z.enum(["slow", "moderate", "fast", "variable"]).optional(),
  genre: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { allowed, retryAfter } = checkRateLimit(`ai-music:${auth.userId}`, 30, 60 * 60 * 1000);
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

    const { workoutType, tempo, genre } = parsed.data;

    const systemPrompt = `You are an expert music curator who specializes in workout and athletic performance playlists. Recommend 4-5 specific genres, artists, and playlist vibes that match the workout context. For each recommendation, include the genre, 2-3 artist names, the energy/vibe description, and why it works for this workout type. Format as a clean numbered list.`;

    const userMessage = `Recommend music for: ${workoutType}${tempo ? ` (${tempo} tempo)` : ""}${genre ? `, preferably ${genre} style` : ""}.`;

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const recommendations = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ success: true, data: { recommendations } });
  } catch (error) {
    console.error("[api/ai/music] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
