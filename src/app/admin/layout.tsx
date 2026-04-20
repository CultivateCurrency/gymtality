"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { MobileHeader } from "@/components/shared/mobile-header";
import { BottomNav } from "@/components/shared/bottom-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Home button — top left corner */}
      <Link
        href="/admin/dashboard"
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
        title="Go to dashboard"
      >
        <Home className="h-6 w-6 text-orange-500" />
      </Link>

      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar variant="admin" />
      </div>

      {/* Mobile sticky header + drawer */}
      <MobileHeader variant="admin" />

      {/* Main content */}
      <main
        id="main-content"
        className={[
          // Desktop: offset for sidebar (w-64)
          "md:ml-64",
          // Mobile: offset for top bar (h-14) + bottom nav (h-16)
          "pt-14 pb-20 md:pb-0",
          "min-h-screen",
        ].join(" ")}
      >
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Breadcrumbs />
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav variant="admin" />
    </div>
  );
}
