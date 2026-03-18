import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/streaming/[id] — Get a single stream
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await context.params;

    const stream = await prisma.stream.findFirst({
      where: { id, tenantId },
    });

    if (!stream) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: stream });
  } catch (error) {
    console.error("[GET /api/streaming/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stream" },
      { status: 500 }
    );
  }
}

// PUT /api/streaming/[id] — Update stream, go live, or end stream
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await context.params;
    const body = await req.json();

    const existing = await prisma.stream.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    const { title, category, type, scheduledAt, price, status } = body;

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (type !== undefined) data.type = type;
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (price !== undefined) data.price = price;

    // Status transitions
    if (status === "LIVE" && existing.status === "SCHEDULED") {
      data.status = "LIVE";
      data.startedAt = new Date();
    } else if (status === "ENDED" && existing.status === "LIVE") {
      data.status = "ENDED";
      data.endedAt = new Date();
    } else if (status !== undefined && status !== existing.status) {
      return NextResponse.json(
        { success: false, error: `Invalid status transition from ${existing.status} to ${status}` },
        { status: 400 }
      );
    }

    const stream = await prisma.stream.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: stream });
  } catch (error) {
    console.error("[PUT /api/streaming/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stream" },
      { status: 500 }
    );
  }
}

// DELETE /api/streaming/[id] — Delete a stream
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await context.params;

    const existing = await prisma.stream.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Stream not found" },
        { status: 404 }
      );
    }

    await prisma.stream.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    console.error("[DELETE /api/streaming/[id]]", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete stream" },
      { status: 500 }
    );
  }
}
