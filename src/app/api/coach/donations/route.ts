import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api";

// GET /api/coach/donations — fetch donations received by this coach
export async function GET(req: NextRequest) {
  try {
    const { user, error } = requireRole(req, ["COACH", "ADMIN"]);
    if (error) return error;

    const coachId = user!.userId;

    const donations = await prisma.donation.findMany({
      where: { coachId },
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = donations.reduce((sum, d) => sum + d.amount, 0);

    return NextResponse.json({
      success: true,
      data: { donations, total },
    });
  } catch (error) {
    console.error("GET /api/coach/donations error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}
