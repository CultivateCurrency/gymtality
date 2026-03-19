import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api";

// GET /api/coach/notifications — fetch coach notifications
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const coachId = user!.userId;

    const notifications = await prisma.notification.findMany({
      where: { userId: coachId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error("GET /api/coach/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT /api/coach/notifications — mark notification(s) as read/unread
export async function PUT(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const coachId = user!.userId;
    const body = await req.json();

    // Mark all as read
    if (body.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: coachId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ success: true, data: { updated: true } });
    }

    // Toggle single notification
    const { id, read } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Notification id is required" },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.updateMany({
      where: { id, userId: coachId },
      data: { read: read ?? true },
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error("PUT /api/coach/notifications error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notification" },
      { status: 500 }
    );
  }
}
