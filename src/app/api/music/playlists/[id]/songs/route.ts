import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params;
    const body = await req.json();
    const { songId } = body;

    if (!songId) {
      return NextResponse.json(
        { success: false, error: "songId is required" },
        { status: 400 }
      );
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      return NextResponse.json(
        { success: false, error: "Playlist not found" },
        { status: 404 }
      );
    }

    const song = await prisma.song.findUnique({ where: { id: songId } });

    if (!song) {
      return NextResponse.json(
        { success: false, error: "Song not found" },
        { status: 404 }
      );
    }

    // Get next order value
    const lastEntry = await prisma.playlistSong.findFirst({
      where: { playlistId },
      orderBy: { order: "desc" },
    });
    const nextOrder = lastEntry ? lastEntry.order + 1 : 0;

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        order: nextOrder,
      },
      include: { song: true },
    });

    return NextResponse.json(
      { success: true, data: playlistSong },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Song already in playlist" },
        { status: 409 }
      );
    }
    console.error("POST /api/music/playlists/[id]/songs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add song to playlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playlistId } = await params;
    const { searchParams } = new URL(req.url);
    const songId = searchParams.get("songId");

    if (!songId) {
      return NextResponse.json(
        { success: false, error: "songId query parameter is required" },
        { status: 400 }
      );
    }

    const entry = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: { playlistId, songId },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "Song not found in playlist" },
        { status: 404 }
      );
    }

    await prisma.playlistSong.delete({ where: { id: entry.id } });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/music/playlists/[id]/songs error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove song from playlist" },
      { status: 500 }
    );
  }
}
