import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/signup", "/verify", "/forgot-password", "/about", "/privacy", "/terms", "/audio"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public pages and static assets
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // No API routes exist in this Next.js app anymore — all API calls go to USER BACKEND
  // But keep this safety check in case any stale routes remain
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isAuthenticated = req.cookies.get("gymtality_auth")?.value === "1";
  const role = req.cookies.get("gymtality_role")?.value || "MEMBER";

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Guests can only browse /member pages — block admin, coach, and write-heavy pages
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
