import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const goals = await prisma.goal.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { goals } });
  } catch (error: any) {
    console.error("Goals GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { title, type, target, current, unit, targetDate, action } = body;

    if (!title || target === undefined) {
      return NextResponse.json(
        { success: false, error: "Title and target are required" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        tenantId,
        userId,
        type: type || "custom",
        title,
        target: parseFloat(target),
        current: parseFloat(current || "0"),
        unit: unit || "",
        targetDate: targetDate ? new Date(targetDate) : null,
        action: action || null,
      },
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error: any) {
    console.error("Goals POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create goal" },
      { status: 500 }
    );
  }
}
