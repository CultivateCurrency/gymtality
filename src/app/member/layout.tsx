import { Sidebar } from "@/components/shared/sidebar";
import { TopHeader } from "@/components/shared/top-header";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MobileHeader } from "@/components/shared/mobile-header";
import { OnboardingTour } from "@/components/shared/onboarding-tour";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar variant="member" />
      </div>

      {/* Desktop top header — hidden on mobile */}
      <div className="hidden md:block">
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
        ].join(" ")}
      >
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav variant="member" />

      <OnboardingTour />
    </div>
  );
}
