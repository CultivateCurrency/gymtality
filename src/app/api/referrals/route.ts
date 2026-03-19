import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const links = await prisma.affiliateLink.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const totalInvites = links.reduce((sum, l) => sum + l.clicks, 0);
    const accepted = links.reduce((sum, l) => sum + l.conversions, 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalInvites,
          accepted,
          rewardsEarned: accepted * 5, // $5 per conversion
        },
        links: links.map((l) => ({
          id: l.id,
          code: l.code,
          campaignName: l.campaignName,
          clicks: l.clicks,
          conversions: l.conversions,
          createdAt: l.createdAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error("Referrals GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch referrals" },
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
    const { campaignName } = body;

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.affiliateLink.findUnique({ where: { code } });
      if (!existing) break;
      code = generateCode();
      attempts++;
    }

    const link = await prisma.affiliateLink.create({
      data: {
        userId,
        code,
        campaignName: campaignName || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: link.id,
        code: link.code,
        campaignName: link.campaignName,
        clicks: link.clicks,
        conversions: link.conversions,
        createdAt: link.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Referrals POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate referral link" },
      { status: 500 }
    );
  }
}
