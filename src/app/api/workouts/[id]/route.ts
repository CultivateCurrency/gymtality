import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;

    const plan = await prisma.workoutPlan.findFirst({
      where: { id, tenantId },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profilePhoto: true,
          },
        },
        exercises: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            likes: true,
            saves: true,
            sessions: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Workout plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    console.error("GET /api/workouts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;
    const body = await req.json();

    // Verify plan exists in tenant
    const existing = await prisma.workoutPlan.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Workout plan not found" },
        { status: 404 }
      );
    }

    const { name, description, repetitions, type, category, subcategory, coverImage, difficulty } = body;

    const plan = await prisma.workoutPlan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(repetitions !== undefined && { repetitions }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(coverImage !== undefined && { coverImage }),
        ...(difficulty !== undefined && { difficulty }),
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profilePhoto: true,
          },
        },
        exercises: {
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            likes: true,
            saves: true,
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: plan });
  } catch (error: any) {
    console.error("PUT /api/workouts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;

    const existing = await prisma.workoutPlan.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Workout plan not found" },
        { status: 404 }
      );
    }

    await prisma.workoutPlan.delete({ where: { id } });

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error("DELETE /api/workouts/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
