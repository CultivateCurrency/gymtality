import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
                profilePhoto: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    console.error("GET /api/community/groups/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch group" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: groupId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "Already a member of this group" },
        { status: 409 }
      );
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        role: "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            profilePhoto: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: member },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/community/groups/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join group" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id: groupId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Not a member of this group" },
        { status: 404 }
      );
    }

    await prisma.groupMember.delete({
      where: { id: member.id },
    });

    return NextResponse.json({
      success: true,
      data: { groupId, userId },
    });
  } catch (error) {
    console.error("DELETE /api/community/groups/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to leave group" },
      { status: 500 }
    );
  }
}
