import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;

    // Verify plan exists in tenant
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, tenantId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Workout plan not found" },
        { status: 404 }
      );
    }

    const exercises = await prisma.exercise.findMany({
      where: { planId: id },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: exercises });
  } catch (error: any) {
    console.error("GET /api/workouts/[id]/exercises error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;
    const body = await req.json();

    // Verify plan exists in tenant
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, tenantId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Workout plan not found" },
        { status: 404 }
      );
    }

    const { name, description, targetBodyParts, duration, equipmentNeeded, videoUrl, thumbnailUrl, order, sets, reps, restSeconds } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Exercise name is required" },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        planId: id,
        name,
        description,
        targetBodyParts: targetBodyParts || [],
        duration,
        equipmentNeeded,
        videoUrl,
        thumbnailUrl,
        order: order ?? 0,
        sets,
        reps,
        restSeconds,
      },
    });

    return NextResponse.json(
      { success: true, data: exercise },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/workouts/[id]/exercises error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
