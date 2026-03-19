import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "weekly";

    const sessions = await prisma.workoutSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      include: {
        plan: { select: { name: true } },
      },
    });

    const completed = sessions.filter((s) => s.completedAt);
    const totalWorkouts = completed.length;
    const totalMinutes = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalCalories = completed.length * 250;

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions.map((s) => ({
          id: s.id,
          startedAt: s.startedAt.toISOString(),
          completedAt: s.completedAt?.toISOString() || null,
          duration: s.duration,
          forgeScore: s.forgeScore,
          plan: s.plan,
        })),
        summary: { totalWorkouts, totalMinutes, totalCalories },
        pagination: { page: 1, limit: sessions.length, total: sessions.length, totalPages: 1 },
      },
    });
  } catch (error: any) {
    console.error("Activity GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
