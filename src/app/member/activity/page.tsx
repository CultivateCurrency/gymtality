"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  Flame,
  Clock,
  Dumbbell,
  Loader2,
  Calendar,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useSession } from "next-auth/react";

type ViewPeriod = "daily" | "weekly" | "monthly";

interface Session {
  id: string;
  startedAt: string;
  completedAt: string | null;
  duration: number | null;
  forgeScore: number | null;
  plan: { name: string };
}

interface ActivityResponse {
  sessions: Session[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function ActivityPage() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("weekly");
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const { data, loading, error } = useApi<ActivityResponse>(
    userId ? `/api/workouts/sessions?userId=${userId}&limit=200` : null
  );

  const sessions = data?.sessions ?? [];

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.completedAt);
    const totalWorkouts = completed.length;
    const totalMinutes = completed.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalCalories = completed.length * 250; // estimate
    return { totalWorkouts, totalMinutes, totalCalories };
  }, [sessions]);

  // Group sessions into buckets for chart
  const chartData = useMemo(() => {
    const completed = sessions.filter((s) => s.completedAt);
    const now = new Date();

    if (viewPeriod === "daily") {
      // Last 7 days
      const days: { label: string; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toDateString();
        const count = completed.filter((s) => new Date(s.completedAt!).toDateString() === dayStr).length;
        days.push({
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        });
      }
      return days;
    } else if (viewPeriod === "weekly") {
      // Last 8 weeks
      const weeks: { label: string; count: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        const count = completed.filter((s) => {
          const d = new Date(s.completedAt!);
          return d >= weekStart && d < weekEnd;
        }).length;
        weeks.push({
          label: `W${8 - i}`,
          count,
        });
      }
      return weeks;
    } else {
      // Last 6 months
      const months: { label: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const count = completed.filter((s) => {
          const d = new Date(s.completedAt!);
          return d >= m && d <= mEnd;
        }).length;
        months.push({
          label: m.toLocaleDateString("en-US", { month: "short" }),
          count,
        });
      }
      return months;
    }
  }, [sessions, viewPeriod]);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  // Recent workout history
  const recentSessions = sessions
    .filter((s) => s.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="h-8 w-8 text-orange-500" />
          Activity
        </h1>
        <p className="text-zinc-400 mt-1">Your workout history and performance summary</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Dumbbell className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                  {loading ? "--" : stats.totalWorkouts}
                </p>
                <p className="text-sm text-zinc-400">Total Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Flame className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                  {loading ? "--" : stats.totalCalories.toLocaleString()}
                </p>
                <p className="text-sm text-zinc-400">Est. Calories Burned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${loading ? "animate-pulse" : ""}`}>
                  {loading ? "--" : stats.totalMinutes}
                </p>
                <p className="text-sm text-zinc-400">Total Minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Toggle */}
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly"] as ViewPeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setViewPeriod(period)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
              viewPeriod === period
                ? "bg-orange-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load activity data. Please try again.</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Bar Chart */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Workout Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {chartData.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-zinc-400">{bar.count}</span>
                    <div className="w-full flex justify-center">
                      <div
                        className="w-full max-w-[40px] bg-orange-500 rounded-t transition-all"
                        style={{
                          height: `${Math.max(4, (bar.count / maxCount) * 120)}px`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{bar.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workout History */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Recent Workout History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">
                  No completed workouts yet. Start your first session!
                </p>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800 transition"
                    >
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Dumbbell className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {s.plan.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(s.completedAt!).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {s.duration && (
                        <span className="text-xs text-zinc-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.duration} min
                        </span>
                      )}
                      {s.forgeScore && (
                        <span className="text-xs text-orange-400 font-medium">
                          {s.forgeScore} pts
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
