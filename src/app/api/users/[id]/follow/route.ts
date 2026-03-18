import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params;
    const body = await request.json();
    const { followerId } = body;

    if (!followerId) {
      return NextResponse.json(
        { success: false, error: "followerId is required" },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { success: false, error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } });
      return NextResponse.json({
        success: true,
        data: { action: "unfollowed" },
      });
    }

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
    });

    return NextResponse.json(
      { success: true, data: { action: "followed", follow } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/users/[id]/follow error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "followers";

    if (type !== "followers" && type !== "following") {
      return NextResponse.json(
        { success: false, error: "type must be 'followers' or 'following'" },
        { status: 400 }
      );
    }

    if (type === "followers") {
      const followers = await prisma.follow.findMany({
        where: { followingId: id },
        include: {
          follower: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePhoto: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        data: followers.map((f) => ({ ...f.follower, status: f.status })),
      });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: id },
      include: {
        following: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: following.map((f) => ({ ...f.following, status: f.status })),
    });
  } catch (error) {
    console.error("GET /api/users/[id]/follow error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch follow data" },
      { status: 500 }
    );
  }
}
