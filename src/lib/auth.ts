"use client";

// Role-based access control — use in client components for permission checks
export function requireRole(userRole: string, allowedRoles: string[]) {
  if (!allowedRoles.includes(userRole)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}
