import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const IS_PROD = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const FIFTEEN_MINUTES = 60 * 15;

interface BackendLoginResponse {
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
  needsVerification?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 failed attempts per 15 minutes per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? "unknown";
    const limit = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many login attempts. Try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
      );
    }

    const body = await req.json();

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const backendData: BackendLoginResponse = await backendRes.json();

    if (!backendRes.ok || !backendData.success || !backendData.data) {
      return NextResponse.json(
        { success: false, error: backendData.error || "Login failed", needsVerification: backendData.needsVerification },
        { status: backendRes.status }
      );
    }

    const { user, accessToken, refreshToken } = backendData.data;

    // Return only user — access token goes into httpOnly cookie, never JS-readable
    const response = NextResponse.json({ success: true, data: { user } });

    const cookieBase = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict" as const,
    };

    // Access token — short-lived, sent with every proxied request
    response.cookies.set("gymtality_at", accessToken, {
      ...cookieBase,
      maxAge: FIFTEEN_MINUTES,
      path: "/",
    });

    // Refresh token — path-scoped to prevent it being sent on every request
    response.cookies.set("gymtality_rt", refreshToken, {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/api/auth/refresh",
    });

    // Session presence flag — middleware checks this for route protection
    response.cookies.set("gymtality_session", "1", {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    // Role — httpOnly, middleware reads it for fallback routing
    response.cookies.set("gymtality_role", user.role, {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
