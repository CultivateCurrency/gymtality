import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: postId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const existingSave = await prisma.save.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingSave) {
      await prisma.save.delete({ where: { id: existingSave.id } });
      return NextResponse.json({
        success: true,
        data: { saved: false },
      });
    }

    await prisma.save.create({
      data: { userId, postId },
    });

    return NextResponse.json({
      success: true,
      data: { saved: true },
    });
  } catch (error) {
    console.error("POST /api/community/posts/[id]/save error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle save" },
      { status: 500 }
    );
  }
}
