import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCoachApprovalEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const status = searchParams.get("status"); // PENDING | APPROVED | DENIED

    const where: any = {
      user: { tenantId },
    };

    if (status) where.approvalStatus = status;

    const [coaches, total] = await Promise.all([
      prisma.coachProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
              profilePhoto: true,
              role: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.coachProfile.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        coaches,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/coaches error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const body = await req.json();

    const { userId, approvalStatus } = body;

    if (!userId || !approvalStatus) {
      return NextResponse.json(
        { success: false, error: "userId and approvalStatus are required" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "DENIED"].includes(approvalStatus)) {
      return NextResponse.json(
        { success: false, error: "approvalStatus must be APPROVED or DENIED" },
        { status: 400 }
      );
    }

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in this tenant" },
        { status: 404 }
      );
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId },
    });

    if (!coachProfile) {
      return NextResponse.json(
        { success: false, error: "Coach profile not found" },
        { status: 404 }
      );
    }

    const updatedProfile = await prisma.coachProfile.update({
      where: { userId },
      data: {
        approvalStatus,
        approvedAt: approvalStatus === "APPROVED" ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // If approved, ensure user role is COACH
    if (approvalStatus === "APPROVED" && user.role === "MEMBER") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "COACH" },
      });
    }

    // Send coach approval/denial email (non-blocking)
    sendCoachApprovalEmail(
      user.email,
      user.fullName,
      approvalStatus === "APPROVED"
    ).catch((err) => console.error("Coach approval email failed:", err));

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/coaches error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
