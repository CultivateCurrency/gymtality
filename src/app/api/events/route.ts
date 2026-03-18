import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const type = searchParams.get("type");
    const upcoming = searchParams.get("upcoming");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: Record<string, unknown> = { tenantId };

    if (type) {
      where.type = type;
    }

    if (upcoming !== "false") {
      // Default to upcoming events
      where.startTime = { gte: new Date() };
    }

    // Date range filters override upcoming
    if (startDate || endDate) {
      const timeFilter: Record<string, Date> = {};
      if (startDate) timeFilter.gte = new Date(startDate);
      if (endDate) timeFilter.lte = new Date(endDate);
      where.startTime = timeFilter;
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { startTime: "asc" },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const body = await req.json();

    const {
      title,
      description,
      type,
      startTime,
      endTime,
      capacity,
      location,
      streamUrl,
      coverImage,
      price,
      isRecurring,
      coachId,
    } = body;

    if (!title || !type || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "title, type, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        tenantId,
        title,
        description,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity: capacity ?? null,
        location,
        streamUrl,
        coverImage,
        price: price ?? 0,
        isRecurring: isRecurring ?? false,
        coachId: coachId ?? null,
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("POST /api/events error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create event" },
      { status: 500 }
    );
  }
}
