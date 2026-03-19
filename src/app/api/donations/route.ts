import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDonationReceivedEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const donations = await prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const total = donations.reduce((sum, d) => sum + d.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        donations: donations.map((d) => ({
          id: d.id,
          amount: d.amount,
          message: d.message,
          createdAt: d.createdAt.toISOString(),
        })),
        total,
      },
    });
  } catch (error: any) {
    console.error("Donations GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch donations" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, message, coachId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.create({
      data: {
        userId,
        amount,
        message: message || null,
        coachId: coachId || null,
      },
    });

    // Notify coach about donation (non-blocking)
    if (coachId) {
      const [coach, donor] = await Promise.all([
        prisma.user.findUnique({ where: { id: coachId } }),
        prisma.user.findUnique({ where: { id: userId } }),
      ]);
      if (coach && donor) {
        sendDonationReceivedEmail(
          coach.email,
          coach.fullName,
          donor.fullName,
          `$${donation.amount.toFixed(2)}`,
          message || undefined
        ).catch((err) => console.error("Donation email failed:", err));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: donation.id,
        amount: donation.amount,
        message: donation.message,
        createdAt: donation.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Donations POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create donation" },
      { status: 500 }
    );
  }
}
