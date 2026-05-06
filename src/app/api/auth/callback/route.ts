import { NextRequest, NextResponse } from "next/server";

const IS_PROD = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const FIFTEEN_MINUTES = 60 * 15;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://gymtality.fit";
const ALLOWED_ORIGINS = [APP_URL, "http://localhost:3000"];

interface CallbackRequest {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    username: string;
    role: string;
    profilePhoto: string | null;
    tenantId: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") ?? "";
    if (IS_PROD && !ALLOWED_ORIGINS.includes(origin)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body: CallbackRequest = await req.json();
    const { accessToken, refreshToken, user } = body;

    if (!accessToken || !refreshToken || !user) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Return only user — access token goes into httpOnly cookie
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
    console.error("[auth/callback] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
