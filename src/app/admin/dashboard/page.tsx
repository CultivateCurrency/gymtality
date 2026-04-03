"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Dumbbell, DollarSign, TrendingUp, Shield, AlertTriangle,
  Calendar, ShoppingBag, BarChart3, Activity, ChevronRight,
  Bell, CheckCircle2, Clock, Loader2,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import dynamic from "next/dynamic";

const RevenueAreaChart = dynamic(
  () => import("@/components/charts").then((m) => m.RevenueAreaChart),
  { ssr: false, loading: () => <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">Loading chart…</div> }
);
const ActivityBarChart = dynamic(
  () => import("@/components/charts").then((m) => m.ActivityBarChart),
  { ssr: false, loading: () => <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">Loading chart…</div> }
);

interface AdminAnalytics {
  totalUsers: number;
  newSignupsThisMonth: number;
  activeUsersLast30Days: number;
  revenue: { totalOrderRevenue: number };
  subscriptions: { plan: string; _count: number }[];
  topTrainers: unknown[];
  usersByRole: { role: string; _count: number }[];
  pendingCoaches: number;
  pendingReports: number;
  monthlyRevenue: { month: string; revenue: number }[];
  dailyActivity: { day: string; users: number }[];
}

const quickLinks = [
  { label: "Manage Users", href: "/admin/users", icon: Users, desc: "View, suspend, or ban members", color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Approve Coaches", href: "/admin/coaches", icon: Shield, desc: "Review certification requests", color: "text-orange-400", bg: "bg-orange-500/10" },
  { label: "Content CMS", href: "/admin/content", icon: Dumbbell, desc: "Categories, workouts, books, music", color: "text-purple-400", bg: "bg-purple-500/10" },
  { label: "Events", href: "/admin/events", icon: Calendar, desc: "Classes, workshops, schedules", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { label: "Commerce", href: "/admin/commerce", icon: ShoppingBag, desc: "Products, orders, inventory", color: "text-pink-400", bg: "bg-pink-500/10" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Revenue, retention, engagement", color: "text-green-400", bg: "bg-green-500/10" },
  { label: "Moderation", href: "/admin/moderation", icon: AlertTriangle, desc: "Reports queue, content review", color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: DollarSign, desc: "Plans, tiers, billing", color: "text-amber-400", bg: "bg-amber-500/10" },
];

export default function AdminDashboard() {
  const { data, loading, error } = useApi<AdminAnalytics>("/api/admin/analytics");

  const totalMembers = data?.usersByRole.find((r) => r.role === "MEMBER")?._count ?? 0;
  const activeCoaches = data?.usersByRole.find((r) => r.role === "COACH")?._count ?? 0;
  const activeSubscriptions = data ? data.subscriptions.reduce((sum, s) => sum + s._count, 0) : 0;
  const revenueMTD = data?.revenue.totalOrderRevenue ?? 0;

  const kpis = [
    { label: "Total Members", value: totalMembers, sub: `+${data?.newSignupsThisMonth ?? 0} this month`, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", gradient: "from-blue-500/5" },
    { label: "Active Coaches", value: activeCoaches, sub: `${data?.pendingCoaches ?? 0} pending approval`, icon: Dumbbell, color: "text-orange-400", bg: "bg-orange-500/10", gradient: "" },
    { label: "Revenue (MTD)", value: `$${revenueMTD.toLocaleString()}`, sub: "from orders", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", gradient: "from-green-500/5" },
    { label: "Active Subscriptions", value: activeSubscriptions, sub: `${data?.activeUsersLast30Days ?? 0} active (30d)`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", gradient: "" },
  ];

  const pendingCoaches = data?.pendingCoaches ?? 0;
  const pendingReports = data?.pendingReports ?? 0;
  const hasPending = pendingCoaches > 0 || pendingReports > 0;

  return (
    <div className="space-y-8">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
          <p className="text-zinc-400 mt-1 text-sm">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/admin/analytics">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white gap-2">
            <BarChart3 size={14} />
            Full Analytics
          </Button>
        </Link>
      </div>

      {/* ── Alerts strip (highest priority — top of Z-scan) ───────────── */}
      {!loading && hasPending && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={15} className="text-amber-400" />
            <p className="text-sm font-semibold text-amber-300">Action Required</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {pendingCoaches > 0 && (
              <Link href="/admin/coaches">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/20 hover:bg-amber-500/25 transition cursor-pointer">
                  <Shield size={13} className="text-amber-400" />
                  <span className="text-sm text-amber-300">
                    <span className="font-bold">{pendingCoaches}</span> coach approval{pendingCoaches > 1 ? "s" : ""} pending
                  </span>
                  <ChevronRight size={12} className="text-amber-400" />
                </div>
              </Link>
            )}
            {pendingReports > 0 && (
              <Link href="/admin/moderation">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 transition cursor-pointer">
                  <AlertTriangle size={13} className="text-red-400" />
                  <span className="text-sm text-red-300">
                    <span className="font-bold">{pendingReports}</span> report{pendingReports > 1 ? "s" : ""} to review
                  </span>
                  <ChevronRight size={12} className="text-red-400" />
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      {error ? (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          Failed to load analytics. <button onClick={() => window.location.reload()} className="underline">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <Card key={k.label} className={`border-zinc-800 ${k.gradient ? `bg-gradient-to-br ${k.gradient} to-zinc-900` : "bg-zinc-900"}`}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${k.bg} shrink-0 mt-0.5`}>
                    <k.icon size={17} className={k.color} />
                  </div>
                  <div>
                    {loading ? (
                      <div className="space-y-1.5">
                        <div className="h-7 w-16 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-white">{k.value}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{k.label}</p>
                        {k.sub && <p className="text-[11px] text-zinc-600 mt-0.5">{k.sub}</p>}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Charts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <DollarSign size={15} className="text-green-400" />
              Revenue
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Monthly order revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <RevenueAreaChart data={data?.monthlyRevenue ?? []} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Activity size={15} className="text-blue-400" />
              User Activity
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">Active users — last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ActivityBarChart data={data?.dailyActivity ?? []} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Subscription breakdown ─────────────────────────────────────── */}
      {!loading && data && data.subscriptions.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <TrendingUp size={15} className="text-purple-400" />
              Subscription Breakdown
            </CardTitle>
            <Link href="/admin/subscriptions">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                Manage <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {data.subscriptions.map((s) => (
                <div key={s.plan} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700">
                  <Badge variant="outline" className="border-purple-500/40 text-purple-400 text-[10px]">{s.plan}</Badge>
                  <span className="text-lg font-bold text-white">{s._count}</span>
                  <span className="text-xs text-zinc-500">subscribers</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Quick Links ────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Manage Platform</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60 transition cursor-pointer h-full group">
                <CardContent className="pt-5 pb-4">
                  <div className={`p-2.5 rounded-lg ${link.bg} w-fit mb-3 group-hover:scale-105 transition-transform`}>
                    <link.icon size={17} className={link.color} />
                  </div>
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-snug">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Status summary ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", label: "Platform Status", value: "All systems operational" },
          { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", label: "Support Tickets", value: "0 open tickets" },
          { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", label: "Active (30d)", value: `${data?.activeUsersLast30Days ?? "—"} users` },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className={`p-2 rounded-lg ${s.bg} shrink-0`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{loading ? "—" : s.value}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
