import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api";

// GET /api/coach/reports — fetch reports and blocks by coach
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const coachId = user!.userId;

    const [reports, blocks] = await Promise.all([
      prisma.report.findMany({
        where: { reporterId: coachId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.block.findMany({
        where: { blockerId: coachId },
        include: {
          blocked: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { reports, blocks },
    });
  } catch (error) {
    console.error("GET /api/coach/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/coach/reports — submit a report, block, or unblock a user
export async function POST(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const coachId = user!.userId;
    const body = await req.json();
    const { action } = body;

    if (action === "report") {
      const { targetType, targetId, reason } = body;
      if (!targetType || !targetId || !reason) {
        return NextResponse.json(
          { success: false, error: "targetType, targetId, and reason are required" },
          { status: 400 }
        );
      }

      const report = await prisma.report.create({
        data: {
          reporterId: coachId,
          targetType,
          targetId,
          reason,
        },
      });

      return NextResponse.json({ success: true, data: report });
    }

    if (action === "block") {
      const { blockedId } = body;
      if (!blockedId) {
        return NextResponse.json(
          { success: false, error: "blockedId is required" },
          { status: 400 }
        );
      }

      const block = await prisma.block.upsert({
        where: {
          blockerId_blockedId: { blockerId: coachId, blockedId },
        },
        update: {},
        create: {
          blockerId: coachId,
          blockedId,
        },
      });

      return NextResponse.json({ success: true, data: block });
    }

    if (action === "unblock") {
      const { blockedId } = body;
      if (!blockedId) {
        return NextResponse.json(
          { success: false, error: "blockedId is required" },
          { status: 400 }
        );
      }

      await prisma.block.deleteMany({
        where: { blockerId: coachId, blockedId },
      });

      return NextResponse.json({ success: true, data: { unblocked: true } });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'report', 'block', or 'unblock'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/coach/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
