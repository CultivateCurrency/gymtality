import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

const IS_PROD = process.env.NODE_ENV === "production";
const SEVEN_DAYS = 60 * 60 * 24 * 7;
const FIFTEEN_MINUTES = 60 * 15;

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("gymtality_rt")?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: "No refresh token" }, { status: 401 });
    }

    // Backend expects { refreshToken } in body (not Authorization header)
    const backendRes = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const backendData = await backendRes.json();

    if (!backendRes.ok || !backendData.success) {
      return NextResponse.json(
        { success: false, error: backendData.error || "Token refresh failed" },
        { status: backendRes.status }
      );
    }

    const { accessToken: newAt, refreshToken: newRt } = backendData.data;

    // Set rotated cookies — tokens never returned to JS
    const response = NextResponse.json({ success: true });

    const cookieBase = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "strict" as const,
    };

    response.cookies.set("gymtality_at", newAt, {
      ...cookieBase,
      maxAge: FIFTEEN_MINUTES,
      path: "/",
    });

    response.cookies.set("gymtality_rt", newRt, {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/api/auth/refresh",
    });

    // Extend session cookie lifetime on each refresh
    response.cookies.set("gymtality_session", "1", {
      ...cookieBase,
      maxAge: SEVEN_DAYS,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[auth/refresh] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
