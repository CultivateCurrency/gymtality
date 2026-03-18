import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: { select: { songs: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: playlists });
  } catch (error) {
    console.error("GET /api/music/playlists error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: "userId and name are required" },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.create({
      data: { userId, name },
    });

    return NextResponse.json(
      { success: true, data: playlist },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/music/playlists error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create playlist" },
      { status: 500 }
    );
  }
}
