import { NextRequest, NextResponse } from "next/server";

// Extract authenticated user from middleware-injected headers
export function getAuthUser(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");
  const tenantId = req.headers.get("x-tenant-id") || "default-tenant";

  if (!userId) return null;

  return { userId, role: role || "MEMBER", tenantId };
}

// Require auth — returns 401 if not authenticated
export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return { user: null, error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, error: null };
}

// Require specific roles
export function requireRole(req: NextRequest, allowedRoles: string[]) {
  const { user, error } = requireAuth(req);
  if (error) return { user: null, error };
  if (!allowedRoles.includes(user!.role)) {
    return { user: null, error: NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null };
}
