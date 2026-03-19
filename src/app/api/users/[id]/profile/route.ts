import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const viewerId = request.headers.get("x-user-id");

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        username: true,
        profilePhoto: true,
        role: true,
        profile: {
          select: {
            bio: true,
            height: true,
            weight: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            workoutPlans: true,
            workoutSessions: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let isFollowing = false;
    if (viewerId && viewerId !== id) {
      const follow = await prisma.follow.findFirst({
        where: { followerId: viewerId, followingId: id },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      success: true,
      data: { user, isFollowing },
    });
  } catch (error) {
    console.error("GET /api/users/[id]/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "age",
      "gender",
      "dob",
      "height",
      "weight",
      "activityLevel",
      "goals",
      "dietPreference",
      "medicalConsiderations",
      "equipmentAccess",
      "injuryFlags",
      "preferredDays",
    ];

    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === "dob") {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: id },
      update: updateData,
      create: {
        userId: id,
        ...updateData,
      },
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("PUT /api/users/[id]/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
