import { NextRequest, NextResponse } from "next/server";

interface AuthUser {
  userId: string;
  role: string;
  tenantId: string;
}

// Extract authenticated user from middleware-injected headers
export function getAuthUser(req: NextRequest): AuthUser | null {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");
  const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

  if (!userId) return null;

  return { userId, role: role || "MEMBER", tenantId };
}

// Require auth — returns NextResponse (401) if not authenticated, otherwise AuthUser
export function requireAuth(req: NextRequest): AuthUser | NextResponse {
  const user = getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return user;
}

// Require ADMIN role — returns NextResponse (403) if not admin
export function requireAdmin(req: NextRequest): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (!["ADMIN", "OWNER", "SUPER_ADMIN"].includes(result.role)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return result;
}

// Require COACH or ADMIN role
export function requireCoach(req: NextRequest): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (!["COACH", "ADMIN", "OWNER", "SUPER_ADMIN"].includes(result.role)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return result;
}

// Require specific roles
export function requireRole(req: NextRequest, allowedRoles: string[]): AuthUser | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (!allowedRoles.includes(result.role)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return result;
}
