import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api";

// GET /api/coach/clients — get coach's clients (users with sessions on coach's plans)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const tenantId = user!.tenantId;
    const coachId = user!.userId;

    // Find all users who have workout sessions on this coach's plans
    const clients = await prisma.user.findMany({
      where: {
        tenantId,
        workoutSessions: {
          some: {
            plan: { coachId },
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        profilePhoto: true,
        createdAt: true,
        workoutSessions: {
          where: { plan: { coachId } },
          select: {
            id: true,
            startedAt: true,
            completedAt: true,
            forgeScore: true,
            plan: {
              select: { id: true, name: true },
            },
          },
          orderBy: { startedAt: "desc" },
        },
        _count: {
          select: {
            workoutSessions: true,
          },
        },
      },
    });

    // Compute stats per client
    const clientsWithStats = clients.map((client) => {
      const sessions = client.workoutSessions;
      const completedSessions = sessions.filter((s) => s.completedAt);
      const activePlan = sessions[0]?.plan || null;
      const lastActive = sessions[0]?.startedAt || client.createdAt;

      return {
        id: client.id,
        fullName: client.fullName,
        username: client.username,
        email: client.email,
        profilePhoto: client.profilePhoto,
        joinedDate: client.createdAt,
        lastActive,
        activePlan,
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        adherence: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: { clients: clientsWithStats, total: clientsWithStats.length },
    });
  } catch (error) {
    console.error("GET /api/coach/clients error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
