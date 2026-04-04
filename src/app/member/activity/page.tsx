"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
  Footprints,
  Heart,
  Moon,
  Watch,
  RefreshCw,
  Target,
  MessageCircle,
  X,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";

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

interface WearableMetrics {
  STEPS: { date: string; value: number }[];
  CALORIES_BURNED: { date: string; value: number }[];
  HEART_RATE: { date: string; value: number }[];
  SLEEP_MINUTES: { date: string; value: number }[];
  DISTANCE_METERS: { date: string; value: number }[];
  ACTIVE_MINUTES: { date: string; value: number }[];
}

interface WearableDataResponse {
  metrics: WearableMetrics;
  summary: {
    todaySteps: number;
    todayCalories: number;
    todayHeartRate: number;
    lastSleepMinutes: number;
    avgDailySteps: number;
  };
}

interface WearableConnection {
  id: string;
  provider: string;
  connected: boolean;
  lastSyncedAt: string | null;
}

interface TimelineItem {
  id: string;
  type: "workout" | "post" | "event" | "goal";
  title: string;
  detail: string | null;
  timestamp: string;
}

const TIMELINE_ICONS: Record<string, { icon: typeof Dumbbell; color: string; bg: string }> = {
  workout: { icon: Dumbbell, color: "text-orange-400", bg: "bg-orange-500/20" },
  post: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-500/20" },
  event: { icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/20" },
  goal: { icon: Target, color: "text-green-400", bg: "bg-green-500/20" },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ActivityPage() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("weekly");
  const { user, accessToken } = useAuthStore();
  const userId = user?.id;

  const [syncing, setSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);

  // Handle redirect back from Google Fit OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      setConnectSuccess(true);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("connected") === "false") {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleConnectGoogleFit = () => {
    if (!accessToken) return;
    // Backend OAuth — passes token via query so it can identify the user
    window.location.href = `${API_URL}/api/wearables/auth/google?token=${accessToken}`;
  };

  const { data, loading, error } = useApi<ActivityResponse>(
    userId ? `/api/workouts/sessions?userId=${userId}&limit=200` : null
  );

  const { data: timeline } = useApi<TimelineItem[]>("/api/users/me/timeline?limit=15");
  const { data: wearableConns } = useApi<WearableConnection[]>("/api/wearables");
  const { data: wearableData, refetch: refetchWearable } = useApi<WearableDataResponse>("/api/wearables/data?days=7");

  const hasWearable = wearableConns?.some((c) => c.connected) || false;
  const wSummary = wearableData?.summary;
  const wMetrics = wearableData?.metrics;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiFetch("/api/wearables/sync", {
        method: "POST",
        body: JSON.stringify({ provider: "GOOGLE_FIT", days: 7 }),
      });
      refetchWearable();
    } catch { /* ignore */ }
    finally { setSyncing(false); }
  };

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

      {/* Wearable Data */}
      {hasWearable && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Watch className="h-5 w-5 text-green-400" />
                Health Data
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled={syncing}
                onClick={handleSync}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? "animate-spin" : ""}`} />
                Sync
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Steps */}
              <div className="p-3 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Footprints className="h-4 w-4 text-blue-400" />
                  <span className="text-xs text-zinc-400">Steps</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {wSummary?.todaySteps?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-zinc-500">today</p>
              </div>

              {/* Calories */}
              <div className="p-3 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-zinc-400">Calories</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {wSummary?.todayCalories?.toLocaleString() || "—"}
                </p>
                <p className="text-xs text-zinc-500">kcal today</p>
              </div>

              {/* Heart Rate */}
              <div className="p-3 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-red-400" />
                  <span className="text-xs text-zinc-400">Heart Rate</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {wSummary?.todayHeartRate || "—"}
                </p>
                <p className="text-xs text-zinc-500">avg bpm</p>
              </div>

              {/* Sleep */}
              <div className="p-3 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs text-zinc-400">Sleep</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {wSummary?.lastSleepMinutes
                    ? `${Math.floor(wSummary.lastSleepMinutes / 60)}h ${wSummary.lastSleepMinutes % 60}m`
                    : "—"}
                </p>
                <p className="text-xs text-zinc-500">last night</p>
              </div>
            </div>

            {/* Steps Trend Mini Chart */}
            {wMetrics?.STEPS && wMetrics.STEPS.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-zinc-400 mb-2">Steps — Last 7 Days (avg {wSummary?.avgDailySteps?.toLocaleString() || 0}/day)</p>
                <div className="flex items-end gap-1 h-16">
                  {wMetrics.STEPS.slice(-7).map((d, i) => {
                    const max = Math.max(...wMetrics.STEPS.slice(-7).map((s) => s.value), 1);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                        <div
                          className="w-full bg-blue-500 rounded-t transition-all max-w-[32px]"
                          style={{ height: `${Math.max(2, (d.value / max) * 48)}px` }}
                        />
                        <span className="text-[10px] text-zinc-600">
                          {new Date(d.date).toLocaleDateString("en-US", { weekday: "narrow" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Connect success banner */}
      {connectSuccess && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
          <div>
            <p className="text-green-400 font-medium text-sm">Google Fit connected!</p>
            <p className="text-zinc-400 text-xs mt-0.5">Your health data will appear here after the first sync.</p>
          </div>
          <button onClick={() => setConnectSuccess(false)} className="ml-auto text-zinc-500 hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Connect Wearable Prompt */}
      {!hasWearable && !loading && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="p-4 rounded-full bg-green-500/10 ring-1 ring-green-500/20">
                <Watch className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Connect Your Wearable</p>
                <p className="text-sm text-zinc-400 mt-1 max-w-sm">
                  Link a fitness tracker to automatically see your steps, heart rate, calories, and sleep data.
                </p>
              </div>
              <Button
                className="bg-green-500 hover:bg-green-400 text-white font-semibold px-6"
                onClick={() => setShowConnectModal(true)}
              >
                <Watch className="h-4 w-4 mr-2" />
                Connect a Device
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect Wearable Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Choose a Device</h2>
              <button onClick={() => setShowConnectModal(false)} className="text-zinc-500 hover:text-zinc-300 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-400">Select a platform to connect. You&apos;ll be redirected to authorize access, then brought right back.</p>

            {/* Google Fit */}
            <button
              onClick={handleConnectGoogleFit}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition group"
            >
              <div className="p-2 rounded-lg bg-white/10">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-white font-medium text-sm">Google Fit</p>
                <p className="text-zinc-500 text-xs">Steps, heart rate, calories & sleep</p>
              </div>
              <span className="text-xs text-green-400 font-medium opacity-0 group-hover:opacity-100 transition">Connect →</span>
            </button>

            {/* Apple Health — coming soon */}
            <button
              disabled
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 opacity-60 cursor-not-allowed"
            >
              <div className="p-2 rounded-lg bg-white/5">
                <Smartphone className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="text-left flex-1">
                <p className="text-zinc-400 font-medium text-sm">Apple Health</p>
                <p className="text-zinc-600 text-xs">Coming soon</p>
              </div>
              <span className="text-xs text-zinc-600 font-medium">Soon</span>
            </button>

            <p className="text-xs text-zinc-600 text-center">
              We only read fitness data — we never post or modify anything.
            </p>
          </div>
        </div>
      )}

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

          {/* Activity Timeline */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!timeline || timeline.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">
                  No activity yet. Start working out, posting, or joining events!
                </p>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[19px] top-0 bottom-0 w-px bg-zinc-800" />
                  <div className="space-y-4">
                    {timeline.map((item) => {
                      const config = TIMELINE_ICONS[item.type] || TIMELINE_ICONS.workout;
                      const Icon = config.icon;
                      return (
                        <div key={`${item.type}-${item.id}`} className="flex items-start gap-4 relative">
                          <div className={`relative z-10 p-2 rounded-full ${config.bg} shrink-0`}>
                            <Icon className={`h-4 w-4 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-medium text-white">{item.title}</p>
                            {item.detail && (
                              <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.detail}</p>
                            )}
                            <p className="text-xs text-zinc-600 mt-1">
                              {new Date(item.timestamp).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
