import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const status = searchParams.get("status"); // PENDING | REVIEWED | RESOLVED | DISMISSED
    const targetType = searchParams.get("targetType"); // POST | USER | COMMENT | CONTENT

    const where: any = {
      reporter: { tenantId },
    };

    if (status) where.status = status;
    if (targetType) where.targetType = targetType;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              username: true,
              profilePhoto: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/moderation error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const { reportId, status } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { success: false, error: "reportId and status are required" },
        { status: 400 }
      );
    }

    if (!["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedReport,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/moderation error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
