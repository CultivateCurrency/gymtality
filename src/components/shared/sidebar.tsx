"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  Calendar,
  Radio,
  Music,
  ShoppingBag,
  MessageCircle,
  User,
  Settings,
  Trophy,
  LogOut,
  HelpCircle,
  Target,
  Activity,
  Search,
  Gift,
  Heart,
  Medal,
  UtensilsCrossed,
  BarChart3,
  FileText,
  Video,
  Bell,
  Compass,
  ChevronRight,
  Star,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const memberNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/member/dashboard", icon: LayoutDashboard },
      { label: "Workouts", href: "/member/workouts", icon: Dumbbell },
      { label: "Activity", href: "/member/activity", icon: Activity },
      { label: "Goals", href: "/member/goals", icon: Target },
      { label: "AI Coach", href: "/member/ai-coach", icon: Star },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Explore", href: "/member/explore", icon: Compass },
      { label: "Community", href: "/member/community", icon: Users },
      { label: "Events", href: "/member/events", icon: Calendar },
      { label: "Streaming", href: "/member/streaming", icon: Radio },
      { label: "Music", href: "/member/music", icon: Music },
      { label: "Book Landing Audio", href: "/member/landing-audio", icon: Radio },
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
      { label: "Help & Support", href: "/member/help", icon: HelpCircle },
      { label: "Profile", href: "/member/profile", icon: User },
      { label: "Settings", href: "/member/settings", icon: Settings },
    ],
  },
];

const coachNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
      { label: "Clients", href: "/coach/clients", icon: Users },
      { label: "Content", href: "/coach/content", icon: Dumbbell },
      { label: "Videos", href: "/coach/videos", icon: Video },
      { label: "Schedule", href: "/coach/schedule", icon: Calendar },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Streaming", href: "/coach/streaming", icon: Radio },
      { label: "Earnings", href: "/coach/earnings", icon: Trophy },
      { label: "Donations", href: "/coach/donations", icon: Heart },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Messages", href: "/coach/messages", icon: MessageCircle },
      { label: "Notifications", href: "/coach/notifications", icon: Bell },
      { label: "Help & Support", href: "/coach/help", icon: HelpCircle },
      { label: "Settings", href: "/coach/settings", icon: Settings },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Coaches", href: "/admin/coaches", icon: Dumbbell },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Content", href: "/admin/content", icon: Music },
      { label: "Music Bookings", href: "/admin/music-bookings", icon: Music },
      { label: "Events", href: "/admin/events", icon: Calendar },
      { label: "Questionnaire", href: "/admin/questionnaire", icon: HelpCircle },
      { label: "Goal Templates", href: "/admin/goals", icon: Target },
      { label: "Diet Templates", href: "/admin/diet", icon: UtensilsCrossed },
      { label: "CMS", href: "/admin/cms", icon: FileText },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Commerce", href: "/admin/commerce", icon: ShoppingBag },
      { label: "Subscriptions", href: "/admin/subscriptions", icon: Star },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: LayoutDashboard },
      { label: "Reports", href: "/admin/reports", icon: BarChart3 },
      { label: "Moderation", href: "/admin/moderation", icon: MessageCircle },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  variant: "member" | "coach" | "admin";
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const groups =
    variant === "member"
      ? memberNavGroups
      : variant === "coach"
        ? coachNavGroups
        : adminNavGroups;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${variant}/explore?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  // Smart active state detection: exact match or parent route
  const isNavItemActive = (itemHref: string): boolean => {
    if (pathname === itemHref) return true;
    // Match parent routes like /member/profile when on /member/profile/[id]
    // But don't match /member/p when on /member/profile
    if (pathname.startsWith(itemHref + "/")) return true;
    return false;
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Get membership label from role or subscription tier
  const getMembershipLabel = () => {
    if (variant === "coach") return "Coach";
    if (variant === "admin") return "Admin";
    // For members, use role-based label
    if (user?.role === "ADMIN") return "Admin";
    if (user?.role === "COACH") return "Coach";
    return "Member";
  };

  const membershipLabel = getMembershipLabel();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-64 bg-zinc-950 border-r border-zinc-800/60 flex flex-col z-40"
      role="navigation"
      aria-label={`${variant} navigation`}
    >
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-zinc-800/60">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <Dumbbell size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-white leading-none">
              GYMTALITY
            </h1>
            <p className="text-[10px] text-zinc-500 capitalize mt-0.5">{variant} portal</p>
          </div>
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-4 pb-2">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search the platform"
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition"
            />
          </div>
        </form>
      </div>

      {/* ── Grouped Navigation ── */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-5" aria-label="Main menu">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = isNavItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-orange-500/40 ${
                      isActive
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={isActive ? "text-orange-400" : "text-zinc-500"}
                    />
                    {item.label}
                    {isActive && (
                      <ChevronRight size={12} className="ml-auto text-orange-400/60" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Profile Summary + Logout ── */}
      <div className="p-3 border-t border-zinc-800/60 space-y-1">
        {/* Profile row */}
        <Link
          href={`/${variant}/profile`}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-zinc-800/60 transition-colors group"
        >
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover border border-zinc-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-orange-400">{initials}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">
              {user?.fullName ?? "Member"}
            </p>
            <p className="text-[10px] text-orange-400/80 font-medium">{membershipLabel}</p>
          </div>
        </Link>

        {/* Logout */}
        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/5 w-full transition-colors"
        >
          <LogOut size={15} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
