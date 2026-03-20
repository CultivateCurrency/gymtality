import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations";
import { sendOTPEmail, sendReferralRewardEmail } from "@/lib/email";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = signUpSchema.parse(body);

    // For MVP, use default tenant. In production, resolve from subdomain
    const tenantSlug = body.tenantSlug || "gymtality";
    let tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    // Create default tenant if it doesn't exist
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          slug: tenantSlug,
          name: "Gymtality",
          status: "ACTIVE",
          plan: "ENTERPRISE",
          features: [
            "workouts",
            "community",
            "events",
            "streaming",
            "music",
            "commerce",
            "challenges",
          ],
        },
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        OR: [{ email: validated.email }, { username: validated.username }],
      },
    });

    if (existingUser) {
      const field =
        existingUser.email === validated.email ? "email" : "username";
      return NextResponse.json(
        { success: false, error: `This ${field} is already registered` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        fullName: validated.fullName,
        username: validated.username,
        email: validated.email,
        passwordHash,
        role: validated.role,
        otpCode,
        otpExpiresAt,
      },
    });

    // Create empty profile
    await prisma.userProfile.create({
      data: { userId: user.id },
    });

    // If coach, create pending coach profile
    if (validated.role === "COACH") {
      await prisma.coachProfile.create({
        data: {
          userId: user.id,
          category: "WORKOUT_TRAINER",
          approvalStatus: "PENDING",
        },
      });
    }

    // Track referral conversion if referral code provided
    if (body.referralCode) {
      const affiliateLink = await prisma.affiliateLink.findUnique({
        where: { code: body.referralCode },
        include: { user: true },
      });
      if (affiliateLink) {
        await prisma.affiliateLink.update({
          where: { id: affiliateLink.id },
          data: { conversions: { increment: 1 } },
        });
        // Notify referrer (non-blocking)
        sendReferralRewardEmail(
          affiliateLink.user.email,
          affiliateLink.user.fullName,
          validated.fullName,
          "$5.00"
        ).catch((err) => console.error("Referral reward email failed:", err));
      }
    }

    // Send OTP email via Resend
    await sendOTPEmail(validated.email, otpCode, "verify");

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Please verify your email.",
        data: {
          userId: user.id,
          email: user.email,
          // Remove in production — only for development
          ...(process.env.NODE_ENV === "development" && { otp: otpCode }),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Signup error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
