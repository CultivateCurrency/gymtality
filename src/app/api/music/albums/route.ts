import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const albums = await prisma.album.findMany({
      where: {
        tenantId,
        ...(category ? { category } : {}),
      },
      include: {
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: albums });
  } catch (error) {
    console.error("GET /api/music/albums error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch albums" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const body = await req.json();
    const { name, coverImage, category } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Album name is required" },
        { status: 400 }
      );
    }

    const album = await prisma.album.create({
      data: {
        tenantId,
        name,
        coverImage: coverImage || null,
        category: category || null,
      },
    });

    return NextResponse.json({ success: true, data: album }, { status: 201 });
  } catch (error) {
    console.error("POST /api/music/albums error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create album" },
      { status: 500 }
    );
  }
}
