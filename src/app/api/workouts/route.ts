import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: any = { tenantId };

    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [plans, total] = await Promise.all([
      prisma.workoutPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          coach: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePhoto: true,
            },
          },
          _count: {
            select: {
              likes: true,
              saves: true,
              sessions: true,
            },
          },
        },
      }),
      prisma.workoutPlan.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        plans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/workouts error:", error);
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

    const { coachId, name, description, repetitions, type, category, subcategory, coverImage, difficulty } = body;

    if (!coachId || !name) {
      return NextResponse.json(
        { success: false, error: "coachId and name are required" },
        { status: 400 }
      );
    }

    // Verify coach exists in tenant
    const coach = await prisma.user.findFirst({
      where: { id: coachId, tenantId },
    });

    if (!coach) {
      return NextResponse.json(
        { success: false, error: "Coach not found in this tenant" },
        { status: 404 }
      );
    }

    const plan = await prisma.workoutPlan.create({
      data: {
        tenantId,
        coachId,
        name,
        description,
        repetitions: repetitions ?? false,
        type: type || "GYM",
        category,
        subcategory,
        coverImage,
        difficulty,
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profilePhoto: true,
          },
        },
        _count: {
          select: {
            likes: true,
            saves: true,
            sessions: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: plan },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/workouts error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
