import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 100);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.userId },
    take: limit,
    orderBy: { startedAt: "desc" },
    include: { plan: { select: { name: true } } },
  });

  return NextResponse.json({
    success: true,
    data: sessions.map((s) => ({
      id: s.id,
      workoutPlan: s.plan ? { title: s.plan.name } : null,
      duration: s.duration ?? 0,
      forgeScore: s.forgeScore ?? 0,
      completedAt: s.completedAt ?? null,
      createdAt: s.startedAt,
    })),
  });
}
