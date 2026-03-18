import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const [groups, total] = await Promise.all([
      prisma.group.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: { members: true },
          },
        },
      }),
      prisma.group.count({ where: { tenantId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        groups,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/community/groups error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const body = await req.json();
    const { name, description, coverImage, createdById } = body;

    if (!name || !createdById) {
      return NextResponse.json(
        { success: false, error: "name and createdById are required" },
        { status: 400 }
      );
    }

    const group = await prisma.group.create({
      data: {
        tenantId,
        name,
        description,
        coverImage,
        createdById,
        members: {
          create: {
            userId: createdById,
            role: "CREATOR",
          },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    console.error("POST /api/community/groups error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create group" },
      { status: 500 }
    );
  }
}
