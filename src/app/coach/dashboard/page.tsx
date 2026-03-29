"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useApi } from "@/hooks/use-api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Dumbbell,
  DollarSign,
  TrendingUp,
  Calendar,
  Upload,
  Radio,
  Star,
  Clock,
} from "lucide-react";

interface DashboardData {
  stats: {
    activeClients: number;
    workoutPlans: number;
    monthlyEarnings: number;
  };
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    type: string;
  }[];
  recentStreams: {
    id: string;
    title: string;
    date: string;
    viewers: number;
  }[];
}

export default function CoachDashboard() {
  const { user } = useAuthStore();
  const { data, loading, error } = useApi<DashboardData>("/api/coach/dashboard");

  const firstName = user?.fullName?.split(" ")[0] || "Coach";

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <div className="h-9 w-64 bg-zinc-800 rounded animate-pulse" />
          <div className="h-5 w-96 bg-zinc-800 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-6 w-12 bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="h-16 bg-zinc-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="h-6 w-40 bg-zinc-800 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-zinc-800 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Coach Dashboard</h1>
          <p className="text-zinc-400 mt-1">Manage your clients, content, and earnings</p>
        </div>
        <Card className="bg-zinc-900 border-red-500/30">
          <CardContent className="pt-6">
            <p className="text-red-400 text-center py-8">
              Failed to load dashboard data: {error}
            </p>
            <div className="flex justify-center pb-4">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-zinc-700 text-zinc-300 hover:text-white"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {firstName}</h1>
        <p className="text-zinc-400 mt-1">Manage your clients, content, and earnings</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-zinc-900 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.stats.activeClients ?? 0}</p>
                <p className="text-sm text-zinc-400">Active Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Dumbbell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.stats.workoutPlans ?? 0}</p>
                <p className="text-sm text-zinc-400">Workout Plans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">${data?.stats.monthlyEarnings ?? 0}</p>
                <p className="text-sm text-zinc-400">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Star className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0.0</p>
                <p className="text-sm text-zinc-400">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/coach/content">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <Upload className="h-8 w-8 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Upload Content</h3>
                <p className="text-sm text-zinc-400">Add workout plans, videos, exercises</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/coach/schedule">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-blue-500/50 transition cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Manage Schedule</h3>
                <p className="text-sm text-zinc-400">Set availability, manage bookings</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/coach/streaming">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-red-500/50 transition cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <Radio className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Go Live</h3>
                <p className="text-sm text-zinc-400">Start a livestream class</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Your latest client interactions and content updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Calendar className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-zinc-400">{event.type}</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">
              No recent activity yet. Start by uploading your first workout plan.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Performance */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Performance
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Client engagement and content metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.recentStreams && data.recentStreams.length > 0 ? (
            <div className="space-y-3">
              {data.recentStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Radio className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{stream.title}</p>
                      <p className="text-xs text-zinc-400">
                        {new Date(stream.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">{stream.viewers} viewers</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-zinc-500">
              Performance charts will appear here as you get clients
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
