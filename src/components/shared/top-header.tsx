"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useApi } from "@/hooks/use-api";
import { useTheme } from "next-themes";
import {
  Bell,
  MessageCircle,
  Search,
  Play,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
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
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: unreadData } = useApi<NotifResponse>("/api/notifications/unread-count");
  const unreadCount = unreadData?.count ?? 0;

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
    <header className="fixed top-0 right-0 left-64 h-16 bg-[var(--card)]/95 backdrop-blur flex items-center justify-center gap-4 px-6 z-30" style={{ boxShadow: "0 1px 3px oklch(0 0 0 / 30%)" }}>
      {/* Search Bar — centered pill */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl">
        <div className="relative w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts, members, events..."
            className="w-full pl-12 pr-4 py-2.5 bg-[var(--muted)] border-none rounded-full text-sm text-foreground placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]/40 transition"
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
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white gap-1.5 h-9 px-3 text-xs transition-colors duration-150"
            >
              <Play size={12} />
              Start Workout
            </Button>
          </Link>
        )}

        {/* Messages */}
        <Link
          href={`/${variant}/messages`}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--sidebar-accent)] transition-colors duration-150"
          aria-label="Messages"
        >
          <MessageCircle size={18} />
        </Link>

        {/* Notifications */}
        <Link
          href={`/${variant}/notifications`}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--sidebar-accent)] transition-colors duration-150"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center border border-[var(--card)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--sidebar-accent)] transition-colors duration-150"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[var(--sidebar-accent)] transition-colors duration-150"
            aria-label="User menu"
            aria-expanded={profileOpen}
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover border border-[var(--border)]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 border border-[var(--primary)]/30 flex items-center justify-center">
                <span className="text-[10px] font-bold text-[var(--primary)]">{initials}</span>
              </div>
            )}
            <div className="hidden lg:block text-left">
              <p className="text-[12px] font-semibold text-foreground leading-tight truncate max-w-[100px]">
                {user?.fullName?.split(" ")[0] ?? "Member"}
              </p>
            </div>
            <ChevronDown size={12} className="text-[var(--muted-foreground)] hidden lg:block" />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-surface z-50 overflow-hidden">
                <div className="px-3 py-3 border-b border-[var(--border)]">
                  <p className="text-[12px] font-semibold text-foreground truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href={`/${variant}/profile`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--sidebar-accent)] transition-colors duration-150"
                  >
                    <User size={14} />
                    Profile
                  </Link>
                  <Link
                    href={`/${variant}/settings`}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--sidebar-accent)] transition-colors duration-150"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                  <div className="h-px bg-[var(--border)] my-1" />
                  <button
                    onClick={() => { setProfileOpen(false); logout(); router.push("/login"); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-[var(--muted-foreground)] hover:text-red-400 hover:bg-red-500/5 w-full transition-colors duration-150"
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
