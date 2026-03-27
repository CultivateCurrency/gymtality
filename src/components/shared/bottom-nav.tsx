"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Users,
  User,
} from "lucide-react";

const memberBottomNav = [
  { label: "Home", href: "/member/dashboard", icon: LayoutDashboard },
  { label: "Workouts", href: "/member/workouts", icon: Dumbbell },
  { label: "Activity", href: "/member/activity", icon: Activity },
  { label: "Community", href: "/member/community", icon: Users },
  { label: "Profile", href: "/member/profile", icon: User },
];

interface BottomNavProps {
  variant: "member" | "coach" | "admin";
}

export function BottomNav({ variant }: BottomNavProps) {
  const pathname = usePathname();

  // Only render for member for now; coach/admin can be extended
  if (variant !== "member") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-16 bg-zinc-950/95 backdrop-blur border-t border-zinc-800/60 flex items-center z-40 md:hidden"
      aria-label="Mobile navigation"
    >
      {memberBottomNav.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive ? "text-orange-400" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <item.icon
              size={20}
              className={isActive ? "text-orange-400" : "text-zinc-500"}
              strokeWidth={isActive ? 2.5 : 1.75}
            />
            <span className={`text-[10px] font-medium ${isActive ? "text-orange-400" : "text-zinc-500"}`}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-8 h-0.5 bg-orange-500 rounded-t-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
