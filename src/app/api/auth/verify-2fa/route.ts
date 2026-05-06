import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const IS_PROD = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const FIFTEEN_MINUTES = 60 * 15;

interface BackendVerifyResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      fullName: string;
      username: string;
      role: string;
      profilePhoto: string | null;
      tenantId: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const { allowed, retryAfter } = checkRateLimit(`verify-2fa:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Try again later." },
        { status: 429, headers: retryAfter ? { "Retry-After": String(retryAfter) } : {} }
      );
    }

    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const backendData: BackendVerifyResponse = await backendRes.json();

    if (!backendRes.ok || !backendData.success || !backendData.data) {
      return NextResponse.json(
        { success: false, error: backendData.error || "Invalid or expired code" },
        { status: backendRes.status }
      );
    }

    const { user, accessToken, refreshToken } = backendData.data;

    const response = NextResponse.json({ success: true, data: { user } });

    const cookieBase = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict" as const,
    };

    response.cookies.set("gymtality_at", accessToken, {
      ...cookieBase,
      maxAge: FIFTEEN_MINUTES,
      path: "/",
    });
    response.cookies.set("gymtality_rt", refreshToken, {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/api/auth/refresh",
    });
    response.cookies.set("gymtality_session", "1", {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/",
    });
    response.cookies.set("gymtality_role", user.role, {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth/verify-2fa] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
