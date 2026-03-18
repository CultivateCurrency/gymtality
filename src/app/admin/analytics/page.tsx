"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Activity,
  Star,
  Calendar,
  MessageSquare,
  Heart,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

interface TopTrainer {
  coach: {
    id: string;
    fullName: string;
    username: string;
    profilePhoto: string | null;
  };
  totalSessions: number;
}

interface SubscriptionCount {
  plan: "BASIC" | "PREMIUM" | "ELITE";
  _count: number;
}

interface UsersByRole {
  role: string;
  _count: number;
}

interface AnalyticsData {
  totalUsers: number;
  newSignupsThisMonth: number;
  activeUsersLast30Days: number;
  revenue: { totalOrderRevenue: number };
  subscriptions: SubscriptionCount[];
  topTrainers: TopTrainer[];
  usersByRole: UsersByRole[];
  pendingCoaches: number;
  pendingReports: number;
}

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const PLAN_COLORS: Record<string, string> = {
  BASIC: "text-zinc-300",
  PREMIUM: "text-amber-400",
  ELITE: "text-purple-400",
};

export default function AdminAnalyticsPage() {
  const { data, loading, error } = useApi<AnalyticsData>("/api/admin/analytics");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-zinc-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <p className="text-red-400">
          {error ?? "Failed to load analytics data."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Platform-wide metrics, engagement, and revenue insights.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-zinc-900 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {data.activeUsersLast30Days.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">Active Users</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500">
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-sm text-zinc-400">Retention Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500">
              <span>N/A</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-sm text-zinc-400">Churn Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500">
              <span>N/A</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <DollarSign className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  ${data.revenue.totalOrderRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">Total Revenue (MTD)</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-zinc-500">
              <span>All time orders</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Active Users Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              User activity chart placeholder
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              Revenue trend chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Trainers */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Top Trainers by Engagement
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Coaches ranked by total sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.topTrainers.length === 0 ? (
            <p className="text-zinc-500 text-sm py-4 text-center">No trainer data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Coach</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Sessions</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Rating</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Engagement</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-zinc-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTrainers.map((trainer) => (
                    <tr
                      key={trainer.coach.id}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-orange-500/20 text-orange-500 text-xs font-bold">
                              {getInitials(trainer.coach.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-white">
                            {trainer.coach.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-300">{trainer.totalSessions}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-zinc-500">—</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-zinc-500">—</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-zinc-500">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscriptions Breakdown (replaces Revenue by Category) */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-500" />
            Subscription Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.subscriptions.length === 0 ? (
            <p className="text-zinc-500 text-sm py-4 text-center">No subscription data available.</p>
          ) : (
            <div className="space-y-3">
              {data.subscriptions.map((sub) => (
                <div
                  key={sub.plan}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                >
                  <span className={`text-sm font-medium ${PLAN_COLORS[sub.plan] ?? "text-zinc-300"}`}>
                    {sub.plan}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-white">
                      {sub._count.toLocaleString()} members
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Attendance & Community */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Class Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
              No data available
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              Community Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-xs text-zinc-400">Posts This Month</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-xs text-zinc-400">Comments</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">—</p>
                <p className="text-xs text-zinc-400">
                  <Heart className="h-3 w-3 inline mr-1" />
                  Likes
                </p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">
                  {data.newSignupsThisMonth.toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400">New Members</p>
              </div>
            </div>
            <div className="h-32 flex items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              Engagement trend chart placeholder
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
