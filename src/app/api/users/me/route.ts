import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const profile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      profilePhoto: true,
      role: true,
      createdAt: true,
      profile: { select: { bio: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: profile.id,
      fullName: profile.fullName,
      username: profile.username,
      email: profile.email,
      profilePhoto: profile.profilePhoto,
      role: profile.role,
      bio: profile.profile?.bio ?? null,
      createdAt: profile.createdAt,
    },
  });
}
