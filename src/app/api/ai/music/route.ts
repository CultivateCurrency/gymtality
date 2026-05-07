import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/api";
import { checkRateLimit } from "@/lib/rate-limit";
import { categorizeMusic } from "@/lib/ai";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const schema = z
  .object({
    songId: z.string().optional(),
    title: z.string().max(200).optional(),
    artist: z.string().max(200).optional(),
    genre: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .refine((d) => d.songId || d.title || d.artist || d.description, {
    message: "Provide at least one of: songId, title, artist, or description",
  });

export async function POST(req: NextRequest) {
  try {
    const auth = requireAuth(req);
    if (auth instanceof NextResponse) return auth;

    const { allowed, retryAfter } = await checkRateLimit(`ai-music:${auth.userId}`, 30, 60 * 60 * 1000);
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

    const { songId, ...metadata } = parsed.data;
    const result = await categorizeMusic(metadata);

    // Save category back to the Song record if a songId was provided
    const accessToken = req.cookies.get("gymtality_at")?.value;
    if (songId && accessToken) {
      fetch(`${BACKEND_URL}/api/music/songs/${songId}/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ category: result.category }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/ai/music] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
