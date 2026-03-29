"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  member: "Member",
  coach: "Coach",
  admin: "Admin",
  dashboard: "Dashboard",
  workouts: "Workouts",
  community: "Community",
  events: "Events",
  streaming: "Streaming",
  music: "Music",
  shop: "Shop",
  messages: "Messages",
  goals: "Goals",
  activity: "Activity",
  leaderboard: "Leaderboard",
  badges: "Badges",
  meals: "Meal Plans",
  donations: "Donations",
  referrals: "Referrals",
  support: "Help & Support",
  profile: "Profile",
  settings: "Settings",
  explore: "Explore",
  clients: "Clients",
  content: "Content",
  videos: "Videos",
  schedule: "Schedule",
  earnings: "Earnings",
  notifications: "Notifications",
  users: "Users",
  coaches: "Coaches",
  questionnaire: "Questionnaire",
  commerce: "Commerce",
  subscriptions: "Subscriptions",
  analytics: "Analytics",
  reports: "Reports",
  moderation: "Moderation",
  cms: "CMS",
  help: "Help",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-4">
      <Link href={`/${segments[0]}/dashboard`} className="text-zinc-500 hover:text-zinc-300 transition">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          {crumb.isLast ? (
            <span className="text-zinc-300 font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-300 transition">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
