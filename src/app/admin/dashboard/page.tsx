"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Dumbbell,
  DollarSign,
  TrendingUp,
  Shield,
  AlertTriangle,
  Calendar,
  ShoppingBag,
  BarChart3,
  Activity,
  Loader2,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import dynamic from "next/dynamic";

const RevenueAreaChart = dynamic(() => import("@/components/charts").then((m) => m.RevenueAreaChart), { ssr: false, loading: () => <div className="h-48 flex items-center justify-center text-zinc-500">Loading...</div> });
const ActivityBarChart = dynamic(() => import("@/components/charts").then((m) => m.ActivityBarChart), { ssr: false, loading: () => <div className="h-48 flex items-center justify-center text-zinc-500">Loading...</div> });

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
  { label: "Manage Users", href: "/admin/users", icon: Users, desc: "View, suspend, or ban members" },
  { label: "Approve Coaches", href: "/admin/coaches", icon: Shield, desc: "Review certification requests" },
  { label: "Content CMS", href: "/admin/content", icon: Dumbbell, desc: "Manage categories, workouts, books, music" },
  { label: "Events", href: "/admin/events", icon: Calendar, desc: "Manage classes, workshops, schedules" },
  { label: "Commerce", href: "/admin/commerce", icon: ShoppingBag, desc: "Products, orders, inventory" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, desc: "Revenue, retention, engagement" },
  { label: "Moderation", href: "/admin/moderation", icon: AlertTriangle, desc: "Reports queue, content review" },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: DollarSign, desc: "Plans, tiers, coupons" },
];

export default function AdminDashboard() {
  const { data, loading, error } = useApi<AdminAnalytics>("/api/admin/analytics");

  const totalMembers = data?.usersByRole.find((r) => r.role === "MEMBER")?._count ?? 0;
  const activeCoaches = data?.usersByRole.find((r) => r.role === "COACH")?._count ?? 0;
  const revenueMTD = data ? `$${data.revenue.totalOrderRevenue.toLocaleString()}` : "$0";
  const activeSubscriptions = data
    ? data.subscriptions.reduce((sum, s) => sum + s._count, 0)
    : 0;

  const stats = [
    { label: "Total Members", value: loading ? "—" : String(totalMembers), icon: Users, color: "text-blue-500", bg: "bg-blue-500/20" },
    { label: "Active Coaches", value: loading ? "—" : String(activeCoaches), icon: Dumbbell, color: "text-orange-500", bg: "bg-orange-500/20" },
    { label: "Revenue (MTD)", value: loading ? "—" : revenueMTD, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/20" },
    { label: "Active Subscriptions", value: loading ? "—" : String(activeSubscriptions), icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
        <p className="text-zinc-400 mt-1">
          Manage your platform, users, content, and revenue
        </p>
      </div>

      {/* Stats */}
      {error ? (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
          Failed to load analytics data. Please try refreshing the page.
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mb-1" />
                    <p className="text-sm text-zinc-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-zinc-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pending Actions */}
      <Card className="bg-gradient-to-r from-amber-500/10 to-zinc-900 border-amber-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Pending Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-amber-500">{data?.pendingCoaches ?? 0}</p>
              )}
              <p className="text-sm text-zinc-400">Coach approvals pending</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-red-500">{data?.pendingReports ?? 0}</p>
              )}
              <p className="text-sm text-zinc-400">Reports to review</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
              <p className="text-2xl font-bold text-blue-500">0</p>
              <p className="text-sm text-zinc-400">Support tickets open</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Manage Platform</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer h-full">
                <CardContent className="pt-6">
                  <link.icon className="h-8 w-8 text-orange-500 mb-3" />
                  <h3 className="font-semibold text-white">{link.label}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{link.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue + Activity Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue
            </CardTitle>
            <CardDescription className="text-zinc-400">Monthly revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <RevenueAreaChart data={data?.monthlyRevenue ?? []} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              User Activity
            </CardTitle>
            <CardDescription className="text-zinc-400">Active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ActivityBarChart data={data?.dailyActivity ?? []} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
