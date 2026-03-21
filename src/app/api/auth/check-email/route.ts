import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: true, data: { needsVerification: false } });
    }

    const user = await prisma.user.findFirst({
      where: { email: email.trim().toLowerCase() },
      select: { emailVerified: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        needsVerification: user ? !user.emailVerified : false,
      },
    });
  } catch {
    return NextResponse.json({ success: true, data: { needsVerification: false } });
  }
}
