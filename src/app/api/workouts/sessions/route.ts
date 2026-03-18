import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in this tenant" },
        { status: 404 }
      );
    }

    const where = { userId };

    const [sessions, total] = await Promise.all([
      prisma.workoutSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startedAt: "desc" },
        include: {
          plan: {
            include: {
              coach: {
                select: {
                  id: true,
                  fullName: true,
                  username: true,
                  profilePhoto: true,
                },
              },
            },
          },
          exercises: {
            include: {
              exercise: true,
            },
          },
        },
      }),
      prisma.workoutSession.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/workouts/sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const body = await req.json();

    const { userId, planId } = body;

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, error: "userId and planId are required" },
        { status: 400 }
      );
    }

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in this tenant" },
        { status: 404 }
      );
    }

    // Verify plan exists in tenant
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, tenantId },
      include: { exercises: { orderBy: { order: "asc" } } },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Workout plan not found in this tenant" },
        { status: 404 }
      );
    }

    // Create session with session exercises pre-populated
    const session = await prisma.workoutSession.create({
      data: {
        userId,
        planId,
        exercises: {
          create: plan.exercises.map((ex) => ({
            exerciseId: ex.id,
            setsCompleted: 0,
            repsCompleted: 0,
            completed: false,
          })),
        },
      },
      include: {
        plan: {
          include: {
            coach: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profilePhoto: true,
              },
            },
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: session },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/workouts/sessions error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
