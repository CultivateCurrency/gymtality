import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id: eventId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Fetch event and verify tenant
    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: { in: ["BOOKED", "ATTENDED"] } },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Check for existing booking
    const existingBooking = await prisma.eventBooking.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (existingBooking && existingBooking.status !== "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "User already has an active booking for this event" },
        { status: 409 }
      );
    }

    // Determine status based on capacity
    let status: "BOOKED" | "WAITLISTED" = "BOOKED";
    if (event.capacity !== null && event._count.bookings >= event.capacity) {
      status = "WAITLISTED";
    }

    let booking;

    if (existingBooking && existingBooking.status === "CANCELLED") {
      // Re-activate cancelled booking
      booking = await prisma.eventBooking.update({
        where: { id: existingBooking.id },
        data: { status, bookedAt: new Date() },
      });
    } else {
      booking = await prisma.eventBooking.create({
        data: {
          eventId,
          userId,
          status,
        },
      });
    }

    return NextResponse.json(
      { success: true, data: booking },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/events/[id]/book error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to book event" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const tenantId = req.headers.get("x-tenant-id") || "default-tenant";
    const { id: eventId } = await context.params;
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify event belongs to tenant
    const event = await prisma.event.findFirst({
      where: { id: eventId, tenantId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    const booking = await prisma.eventBooking.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });

    if (!booking || booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "No active booking found" },
        { status: 404 }
      );
    }

    const cancelled = await prisma.eventBooking.update({
      where: { id: booking.id },
      data: { status: "CANCELLED" },
    });

    // Promote first waitlisted user if a BOOKED spot was freed
    if (booking.status === "BOOKED") {
      const nextWaitlisted = await prisma.eventBooking.findFirst({
        where: { eventId, status: "WAITLISTED" },
        orderBy: { bookedAt: "asc" },
      });

      if (nextWaitlisted) {
        await prisma.eventBooking.update({
          where: { id: nextWaitlisted.id },
          data: { status: "BOOKED" },
        });
      }
    }

    return NextResponse.json({ success: true, data: cancelled });
  } catch (error) {
    console.error("DELETE /api/events/[id]/book error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
