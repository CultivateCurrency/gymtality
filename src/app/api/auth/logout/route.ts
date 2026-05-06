import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(req: NextRequest) {
  const accessToken = req.cookies.get("gymtality_at")?.value;

  // Revoke all refresh tokens for this user on the backend
  if (accessToken) {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    }).catch((err) => console.error("[auth/logout] Backend revocation failed:", err));
  }

  const response = NextResponse.json({ success: true, message: "Logged out" });

  // Clear all auth cookies
  const clearCookie = (name: string, path: string) =>
    response.cookies.set(name, "", { httpOnly: true, maxAge: 0, path });

  clearCookie("gymtality_at", "/");
  clearCookie("gymtality_rt", "/api/auth/refresh");
  clearCookie("gymtality_session", "/");
  clearCookie("gymtality_role", "/");

  return response;
}
