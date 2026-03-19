import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicRoutes = ["/", "/login", "/signup", "/verify", "/forgot-password", "/about", "/privacy", "/terms"];
const authApiRoutes = ["/api/auth/signup", "/api/auth/verify", "/api/auth/forgot-password", "/api/payments/webhook"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public pages and auth API routes
  if (publicRoutes.includes(pathname) || authApiRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Allow NextAuth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Decode JWT without importing Prisma (Edge-compatible)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Redirect unauthenticated users
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = (token.role as string) || "MEMBER";

  // Role-based route protection
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/coach") && !["COACH", "ADMIN"].includes(role)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Inject user info into API request headers for downstream use
  if (pathname.startsWith("/api/")) {
    const headers = new Headers(req.headers);
    headers.set("x-user-id", token.id as string);
    headers.set("x-user-role", role);
    headers.set("x-tenant-id", (token.tenantId as string) || "default-tenant");
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
