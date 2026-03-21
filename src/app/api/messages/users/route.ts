import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/messages/users?q=search — search users for starting a new chat
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const tenantId = req.headers.get("x-tenant-id");
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const q = req.nextUrl.searchParams.get("q") || "";

    const users = await prisma.user.findMany({
      where: {
        tenantId: tenantId || undefined,
        id: { not: userId },
        isBlocked: false,
        OR: q
          ? [
              { fullName: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ]
          : undefined,
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        profilePhoto: true,
        role: true,
        qbUserId: true,
      },
      take: 20,
      orderBy: { fullName: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    console.error("GET /api/messages/users error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
