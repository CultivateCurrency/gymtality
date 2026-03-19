import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { title, type, target, current, unit, targetDate, action, completed } = body;

    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(target !== undefined && { target: parseFloat(target) }),
        ...(current !== undefined && { current: parseFloat(current) }),
        ...(unit !== undefined && { unit }),
        ...(targetDate !== undefined && { targetDate: targetDate ? new Date(targetDate) : null }),
        ...(action !== undefined && { action }),
        ...(completed !== undefined && { completed }),
      },
    });

    return NextResponse.json({ success: true, data: goal });
  } catch (error: any) {
    console.error("Goals PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    await prisma.goal.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    console.error("Goals DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
