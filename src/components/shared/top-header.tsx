"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useApi } from "@/hooks/use-api";
import {
  Bell,
  MessageCircle,
  Search,
  Play,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Derive a readable page title from the pathname
function getPageTitle(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "";
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    workouts: "Workouts",
    activity: "Activity",
    goals: "Goals",
    explore: "Explore",
    community: "Community",
    events: "Events",
    streaming: "Live Streaming",
    music: "Music",
    leaderboard: "Leaderboard",
    badges: "Badges",
    meals: "Meal Plans",
    shop: "Shop",
    messages: "Messages",
    referrals: "Referrals",
    donations: "Donations",
    support: "Help & Support",
    help: "Help & Support",
    profile: "Profile",
    settings: "Settings",
    questionnaire: "Questionnaire",
    clients: "Clients",
    content: "Content",
    videos: "Videos",
    schedule: "Schedule",
    earnings: "Earnings",
    notifications: "Notifications",
    users: "Users",
    coaches: "Coaches",
    analytics: "Analytics",
    reports: "Reports",
    moderation: "Moderation",
    cms: "CMS",
    commerce: "Commerce",
    subscriptions: "Subscriptions",
  };
  return map[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

interface NotifResponse {
  count: number;
}

interface TopHeaderProps {
  variant: "member" | "coach" | "admin";
}

export function TopHeader({ variant }: TopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unreadData } = useApi<NotifResponse>("/api/notifications/unread-count");
  const unreadCount = unreadData?.count ?? 0;

  const pageTitle = getPageTitle(pathname);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${variant}/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-zinc-950/95 backdrop-blur border-b border-zinc-800/60 flex items-center gap-4 px-6 z-30">
      {/* Page Title */}
      <h2 className="text-sm font-semibold text-white min-w-[120px]">{pageTitle}</h2>

      {/* Search Bar — desktop */}
      <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts, members, events..."
            className="w-full pl-8 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition"
          />
        </div>
      </form>

      {/* Right side actions */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Start Workout CTA — member only */}
        {variant === "member" && (
          <Link href="/member/workouts" className="hidden lg:block">
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5 h-8 px-3 text-xs"
            >
              <Play size={12} />
              Start Workout
            </Button>
          </Link>
        )}

        {/* Messages */}
        <Link
          href={`/${variant}/messages`}
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Messages"
        >
          <MessageCircle size={17} />
        </Link>

        {/* Notifications */}
        <Link
          href={`/${variant}/notifications`}
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 border border-zinc-950" />
          )}
        </Link>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
            aria-label="User menu"
            aria-expanded={profileOpen}
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.fullName}
                className="w-7 h-7 rounded-full object-cover border border-zinc-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-orange-400">{initials}</span>
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-[12px] font-semibold text-white leading-tight truncate max-w-[100px]">
                {user?.fullName?.split(" ")[0] ?? "Member"}
              </p>
            </div>
            <ChevronDown size={12} className="text-zinc-500 hidden lg:block" />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-3 py-3 border-b border-zinc-800">
                  <p className="text-[12px] font-semibold text-white truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href={`/${variant}/profile`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <User size={14} />
                    Profile
                  </Link>
                  <Link
                    href={`/${variant}/settings`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <div className="h-px bg-zinc-800 my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); logout(); router.push("/login"); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-zinc-300 hover:text-red-400 hover:bg-red-500/5 w-full transition-colors"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
