import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

    const album = await prisma.album.findFirst({
      where: { id, tenantId },
      include: {
        songs: { orderBy: { order: "asc" } },
      },
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: album });
  } catch (error) {
    console.error("GET /api/music/albums/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch album" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const body = await req.json();
    const { name, coverImage, category } = body;

    const existing = await prisma.album.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    const album = await prisma.album.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(coverImage !== undefined && { coverImage }),
        ...(category !== undefined && { category }),
      },
    });

    return NextResponse.json({ success: true, data: album });
  } catch (error) {
    console.error("PUT /api/music/albums/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update album" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

    const existing = await prisma.album.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Album not found" },
        { status: 404 }
      );
    }

    await prisma.album.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error("DELETE /api/music/albums/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete album" },
      { status: 500 }
    );
  }
}
