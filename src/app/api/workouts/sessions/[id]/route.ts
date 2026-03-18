import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id } = await params;
    const body = await req.json();

    // Verify session exists and belongs to a user in this tenant
    const existing = await prisma.workoutSession.findUnique({
      where: { id },
      include: {
        user: { select: { tenantId: true } },
      },
    });

    if (!existing || existing.user.tenantId !== tenantId) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    const { completedAt, duration, forgeScore, exercises } = body;

    // Update session fields
    const sessionUpdate: any = {};
    if (completedAt !== undefined) sessionUpdate.completedAt = completedAt === true ? new Date() : completedAt;
    if (duration !== undefined) sessionUpdate.duration = duration;
    if (forgeScore !== undefined) sessionUpdate.forgeScore = forgeScore;

    const session = await prisma.workoutSession.update({
      where: { id },
      data: sessionUpdate,
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

    // Update individual session exercises if provided
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        if (!ex.id) continue;
        await prisma.sessionExercise.update({
          where: { id: ex.id },
          data: {
            ...(ex.setsCompleted !== undefined && { setsCompleted: ex.setsCompleted }),
            ...(ex.repsCompleted !== undefined && { repsCompleted: ex.repsCompleted }),
            ...(ex.weight !== undefined && { weight: ex.weight }),
            ...(ex.completed !== undefined && { completed: ex.completed }),
          },
        });
      }

      // Re-fetch with updated exercises
      const updated = await prisma.workoutSession.findUnique({
        where: { id },
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

      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    console.error("PUT /api/workouts/sessions/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
