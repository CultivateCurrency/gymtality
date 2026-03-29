import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = requireAuth(req);
  if (user instanceof NextResponse) return user;

  const mine = req.nextUrl.searchParams.get("mine");
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 100);

  const where = mine === "true"
    ? { userId: user.userId }
    : { tenantId: user.tenantId };

  const posts = await prisma.post.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, fullName: true, username: true, profilePhoto: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.caption,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      _count: p._count,
      user: p.user,
      createdAt: p.createdAt,
    })),
  });
}
