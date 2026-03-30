"use client";

import Link from "next/link";
import { Sidebar } from "@/components/shared/sidebar";
import { TopHeader } from "@/components/shared/top-header";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MobileHeader } from "@/components/shared/mobile-header";
import { OnboardingTour } from "@/components/shared/onboarding-tour";
import { useAuthStore } from "@/store/auth-store";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const isGuest = user?.role === "GUEST";

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Guest banner */}
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-center text-[13px] font-medium py-2 px-4 flex items-center justify-center gap-3">
          <span>You&apos;re browsing as a guest — some features are limited.</span>
          <Link href="/signup" className="underline font-bold hover:text-orange-100 transition-colors">
            Create a free account
          </Link>
        </div>
      )}

      {/* Desktop sidebar — hidden on mobile */}
      <div className={`hidden md:block ${isGuest ? "mt-9" : ""}`}>
        <Sidebar variant="member" />
      </div>

      {/* Desktop top header — hidden on mobile */}
      <div className={`hidden md:block ${isGuest ? "mt-9" : ""}`}>
        <TopHeader variant="member" />
      </div>

      {/* Mobile sticky header + drawer */}
      <MobileHeader variant="member" />

      {/* Main content */}
      <main
        id="main-content"
        className={[
          // Desktop: offset for sidebar (w-64) + top header (h-16)
          "md:ml-64 md:pt-16",
          // Mobile: offset for top bar (h-14) + bottom nav (h-16)
          "pt-14 pb-20 md:pb-0",
          "min-h-screen",
          isGuest ? "mt-9 md:mt-0" : "",
        ].join(" ")}
      >
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav variant="member" />

      {!isGuest && <OnboardingTour />}
    </div>
  );
}
