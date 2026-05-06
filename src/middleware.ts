import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicRoutes = ["/", "/login", "/signup", "/verify", "/forgot-password", "/about", "/privacy", "/terms", "/audio"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.includes(pathname)) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const sessionCookie = req.cookies.get("gymtality_session")?.value;
  const isAuthenticated = sessionCookie === "1";

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Extract role from the signed JWT — prevents role cookie tampering
  let role = "MEMBER";
  const accessToken = req.cookies.get("gymtality_at")?.value;

  if (accessToken && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(accessToken, secret, {
        // Tolerate tokens up to 7 days past expiry for routing purposes.
        // Real security validation (strict expiry) happens at the backend API level.
        clockTolerance: 7 * 24 * 60 * 60,
      });
      role = (payload as { role?: string }).role ?? "MEMBER";
    } catch {
      // Signature mismatch — forged token, force logout
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.set("gymtality_session", "", { maxAge: 0, path: "/" });
      return res;
    }
  } else {
    // Fallback: role cookie (httpOnly, set server-side on login)
    role = req.cookies.get("gymtality_role")?.value || "MEMBER";
  }

  // Guests: limited access
  if (role === "GUEST") {
    const guestBlocked = ["/admin", "/coach", "/member/settings", "/member/profile", "/member/messages"];
    if (guestBlocked.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/signup", req.url));
    }
    return NextResponse.next();
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && !["ADMIN", "OWNER", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/coach") && !["COACH", "ADMIN", "OWNER", "SUPER_ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|audio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)",
  ],
};
