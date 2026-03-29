import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { FollowStatus } from "@/generated/prisma/enums";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.userId, status: FollowStatus.ACCEPTED } }),
    prisma.follow.count({ where: { followerId: user.userId, status: FollowStatus.ACCEPTED } }),
  ]);

  return NextResponse.json({ success: true, data: { followers, following } });
}
