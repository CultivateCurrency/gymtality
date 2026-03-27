"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useApi } from "@/hooks/use-api";
import {
  Menu,
  X,
  Bell,
  Play,
  Target,
  Compass,
  Calendar,
  Radio,
  Music,
  Medal,
  Trophy,
  UtensilsCrossed,
  ShoppingBag,
  MessageCircle,
  Gift,
  Heart,
  HelpCircle,
  Settings,
  LogOut,
  Dumbbell,
} from "lucide-react";

// Secondary nav items (everything not in bottom nav)
const memberSecondaryNav = [
  {
    label: "Fitness",
    items: [
      { label: "Goals", href: "/member/goals", icon: Target },
      { label: "Explore", href: "/member/explore", icon: Compass },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Events", href: "/member/events", icon: Calendar },
      { label: "Streaming", href: "/member/streaming", icon: Radio },
      { label: "Music", href: "/member/music", icon: Music },
    ],
  },
  {
    label: "Progress",
    items: [
      { label: "Leaderboard", href: "/member/leaderboard", icon: Medal },
      { label: "Badges", href: "/member/badges", icon: Trophy },
    ],
  },
  {
    label: "Nutrition & Shop",
    items: [
      { label: "Meal Plans", href: "/member/meals", icon: UtensilsCrossed },
      { label: "Shop", href: "/member/shop", icon: ShoppingBag },
    ],
  },
  {
    label: "Social",
    items: [
      { label: "Messages", href: "/member/messages", icon: MessageCircle },
      { label: "Referrals", href: "/member/referrals", icon: Gift },
      { label: "Donations", href: "/member/donations", icon: Heart },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Help & Support", href: "/member/support", icon: HelpCircle },
      { label: "Settings", href: "/member/settings", icon: Settings },
    ],
  },
];

interface NotifResponse {
  count: number;
}

function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const map: Record<string, string> = {
    dashboard: "Dashboard", workouts: "Workouts", activity: "Activity",
    goals: "Goals", explore: "Explore", community: "Community",
    events: "Events", streaming: "Live Streaming", music: "Music",
    leaderboard: "Leaderboard", badges: "Badges", meals: "Meal Plans",
    shop: "Shop", messages: "Messages", referrals: "Referrals",
    donations: "Donations", support: "Help & Support", help: "Help & Support",
    profile: "Profile", settings: "Settings", questionnaire: "Questionnaire",
  };
  return map[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function MobileHeader({ variant }: { variant: "member" | "coach" | "admin" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: unreadData } = useApi<NotifResponse>("/api/notifications/unread-count");
  const unreadCount = unreadData?.count ?? 0;

  const pageTitle = getPageTitle(pathname);

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      {/* Sticky top bar — mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60 flex items-center gap-3 px-4 z-40">
        {/* Hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <Link href={`/${variant}/dashboard`} className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center">
            <Dumbbell size={12} className="text-white" />
          </div>
          <span className="text-sm font-black text-white tracking-tight">GYMTALITY</span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-1 ml-auto">
          <Link
            href={`/${variant}/messages`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-16 w-2 h-2 rounded-full bg-orange-500 border border-zinc-950" />
            )}
          </Link>
          <Link href={`/${variant}/workouts`} className="ml-1">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 rounded-lg">
              <Play size={12} className="text-white" />
              <span className="text-[11px] font-bold text-white">Go</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-zinc-950 border-r border-zinc-800/60 z-50 flex flex-col transition-transform duration-300 md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
              <Dumbbell size={14} className="text-white" />
            </div>
            <span className="text-sm font-black text-white">GYMTALITY</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {memberSecondaryNav.map((group) => (
            <div key={group.label}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                        isActive
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent"
                      }`}
                    >
                      <item.icon size={15} className={isActive ? "text-orange-400" : "text-zinc-500"} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile + logout */}
        <div className="p-3 border-t border-zinc-800/60 space-y-1">
          <Link
            href={`/${variant}/profile`}
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-zinc-700" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-400">{initials}</span>
              </div>
            )}
            <div>
              <p className="text-[13px] font-semibold text-white">{user?.fullName ?? "Member"}</p>
              <p className="text-[10px] text-orange-400/80">View Profile</p>
            </div>
          </Link>
          <button
            onClick={() => { setDrawerOpen(false); logout(); router.push("/login"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-zinc-500 hover:text-red-400 hover:bg-red-500/5 w-full transition-colors"
          >
            <LogOut size={15} />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
