import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { receiverId, type } = await req.json();

    if (!receiverId) {
      return NextResponse.json(
        { success: false, error: "Receiver is required" },
        { status: 400 }
      );
    }

    const request = await prisma.workoutRequest.create({
      data: {
        senderId: userId,
        receiverId,
        location: type === "outdoor" ? "OUTDOOR" : "INDOOR",
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error: any) {
    console.error("Workout request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send workout request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const requests = await prisma.workoutRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, fullName: true, username: true, profilePhoto: true } },
        receiver: { select: { id: true, fullName: true, username: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { requests } });
  } catch (error: any) {
    console.error("Workout request GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
