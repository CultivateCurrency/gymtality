"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Users,
  Calendar,
  Radio,
  Music,
  ShoppingBag,
  Flame,
  TrendingUp,
  Trophy,
  Heart,
  Play,
  ChevronRight,
  Target,
  Zap,
  CreditCard,
  Medal,
  UtensilsCrossed,
  Star,
  Clock,
  Activity,
  Compass,
  Gift,
  Salad,
  Sparkles,
  CheckCircle,
  Circle,
  MessageCircle,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";

// ── Quick action cards shown in the hero area ──────────────────────────────
const quickActions = [
  { label: "Start Workout", href: "/member/workouts", icon: Dumbbell, color: "bg-orange-500", textColor: "text-white" },
  { label: "Log Meal", href: "/member/meals", icon: Salad, color: "bg-green-500/10 border border-green-500/20", textColor: "text-green-400" },
  { label: "Join Stream", href: "/member/streaming", icon: Radio, color: "bg-red-500/10 border border-red-500/20", textColor: "text-red-400" },
  { label: "Community", href: "/member/community", icon: Users, color: "bg-indigo-500/10 border border-indigo-500/20", textColor: "text-indigo-400" },
];

// ── Explore shortcuts grid ────────────────────────────────────────────────
const exploreCards = [
  { label: "Events", href: "/member/events", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { label: "Streaming", href: "/member/streaming", icon: Radio, color: "text-red-400", bg: "bg-red-500/10" },
  { label: "Music", href: "/member/music", icon: Music, color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Explore", href: "/member/explore", icon: Compass, color: "text-teal-400", bg: "bg-teal-500/10" },
  { label: "Shop", href: "/member/shop", icon: ShoppingBag, color: "text-pink-400", bg: "bg-pink-500/10" },
  { label: "Referrals", href: "/member/referrals", icon: Gift, color: "text-amber-400", bg: "bg-amber-500/10" },
  { label: "Leaderboard", href: "/member/leaderboard", icon: Medal, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { label: "Badges", href: "/member/badges", icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10" },
];

// ── Type definitions ──────────────────────────────────────────────────────
interface Session {
  id: string;
  completedAt: string | null;
  createdAt: string;
  duration: number;
  forgeScore: number;
  workoutPlan?: { title: string } | null;
}

interface EventsResponse {
  events: Array<{ id: string; title: string; startTime: string; type: string }>;
}

interface StreamsResponse {
  streams: Array<{ id: string; title: string; status: string }>;
}

interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  targetDate: string | null;
}

interface LeaderboardResponse {
  leaderboard: Array<{ userId: string; fullName: string; points: number; rank: number }>;
  myRank: number | null;
  myPoints: number;
}

interface BadgeResponse {
  badges: Array<{ id: string; title: string; description: string; icon: string; earnedAt: string | null }>;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const { user } = useAuthStore();

  const { data: sessions, loading: sessionsLoading } = useApi<Session[]>("/api/workouts/sessions?limit=100");
  const { data: subscriptionData } = useApi<{ plan: string; status: string } | null>("/api/payments/subscription");
  const { data: eventsData, loading: eventsLoading } = useApi<EventsResponse>("/api/events?upcoming=true&limit=3");
  const { data: streamsData } = useApi<StreamsResponse>("/api/streaming?status=LIVE&limit=1");
  const { data: goalsData, loading: goalsLoading } = useApi<{ goals: Goal[] }>("/api/workouts/goals?limit=3");
  const { data: leaderboardData } = useApi<LeaderboardResponse>("/api/misc/leaderboard");
  const { data: badgesData } = useApi<BadgeResponse>("/api/badges?limit=4");
  const { data: challengesData } = useApi<{ challenges: Array<{ id: string; title: string; description: string; progress: number; target: number }> }>("/api/challenges");
  const { data: communityFeedData } = useApi<{ posts: Array<{ id: string; author: { fullName: string; username: string; profilePhoto: string | null }; content: string; createdAt: string; _count: { likes: number; comments: number } }> }>("/api/community/feed?page=1&limit=3");

  // ── Computed stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const list = sessions ?? [];
    const completed = list.filter((s) => s.completedAt);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const workoutsThisWeek = completed.filter(
      (s) => new Date(s.completedAt!) >= startOfWeek
    ).length;

    let streak = 0;
    if (completed.length > 0) {
      const completedDates = new Set(
        completed.map((s) => new Date(s.completedAt!).toDateString())
      );
      for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        if (completedDates.has(d.toDateString())) streak++;
        else if (i > 0) break;
      }
    }

    const totalMinutes = completed.reduce((acc, s) => acc + (s.duration || 0), 0);
    return { totalWorkouts: completed.length, workoutsThisWeek, streak, totalMinutes };
  }, [sessions]);

  const nextEvent = eventsData?.events?.[0] ?? null;
  const upcomingEvents = eventsData?.events ?? [];
  const liveStream = streamsData?.streams?.[0] ?? null;
  const goals = goalsData?.goals ?? [];
  const earnedBadges = (badgesData?.badges ?? []).filter((b) => b.earnedAt);
  const userName = user?.fullName?.split(" ")[0] || "Athlete";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8">

      {/* ── Hero: Welcome + Quick Actions ─────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/10 border border-zinc-800/60 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-zinc-500 text-xs">{today}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
              Welcome back, {userName}
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">
              {stats.streak > 0
                ? `You're on a ${stats.streak}-day streak — keep it up!`
                : "Start a workout today to build your streak."}
            </p>
          </div>
          {/* Streak badge */}
          {stats.streak > 0 && (
            <div className="shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/15 border border-orange-500/30">
              <Flame size={22} className="text-orange-400" />
              <span className="text-lg font-black text-white leading-none">{stats.streak}</span>
              <span className="text-[9px] text-orange-400/70 uppercase tracking-wide">streak</span>
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl ${action.color} cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02]`}>
                <action.icon size={16} className={action.textColor} />
                <span className={`text-[13px] font-semibold ${action.textColor}`}>{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Day Streak", value: stats.streak, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10", accent: "from-orange-500/10" },
          { label: "This Week", value: stats.workoutsThisWeek, icon: Dumbbell, color: "text-blue-400", bg: "bg-blue-500/10", accent: "" },
          { label: "Total Workouts", value: stats.totalWorkouts, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10", accent: "" },
          { label: "Total Minutes", value: stats.totalMinutes, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10", accent: "" },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-zinc-900 border-zinc-800 ${stat.accent ? `bg-gradient-to-br ${stat.accent} to-zinc-900` : ""}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-white ${sessionsLoading ? "animate-pulse opacity-40" : ""}`}>
                    {sessionsLoading ? "—" : stat.value}
                  </p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── AI Coach Quick Start ────────────────────────────────────────── */}
      <Link href="/member/ai-coach" className="block">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/15 via-zinc-900 to-zinc-900 border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer group">
          <div className="p-2.5 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 shrink-0 transition-colors">
            <Sparkles size={18} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">✨ Generate Your Perfect Workout Plan</p>
            <p className="text-xs text-zinc-400 mt-0.5">Let our AI coach create a personalized plan based on your goals, equipment, and preferences.</p>
          </div>
          <div className="shrink-0">
            <ChevronRight size={18} className="text-purple-400/60 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>
      </Link>

      {/* ── Subscription upgrade banner (only shown when no active sub) ── */}
      {subscriptionData === null && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/15 to-zinc-900 border border-orange-500/20">
          <div className="p-2.5 rounded-xl bg-orange-500/20 shrink-0">
            <CreditCard size={18} className="text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Unlock the full Gymtality experience</p>
            <p className="text-xs text-zinc-400 mt-0.5">Get unlimited workouts, live streaming, coaching & more with a membership plan.</p>
          </div>
          <Link href="/member/settings?section=subscription" className="shrink-0">
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
              <Zap size={13} />
              Upgrade
            </Button>
          </Link>
        </div>
      )}

      {/* ── Two-column: Goals + Events ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Goals Snapshot */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Target size={16} className="text-orange-500" />
              Goals
            </CardTitle>
            <Link href="/member/goals">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                View all <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {goalsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : goals.length > 0 ? (
              goals.map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">{goal.title}</p>
                      <span className="text-xs text-zinc-500 shrink-0 ml-2">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {goal.targetDate && (
                      <p className="text-[11px] text-zinc-600">
                        Due {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <Target size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No active goals</p>
                <Link href="/member/goals">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white mt-3 h-8 text-xs">
                    Set a Goal
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Calendar size={16} className="text-cyan-500" />
              Upcoming Events
            </CardTitle>
            <Link href="/member/events">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                View all <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />)}
              </div>
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
                  <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0">
                    <Calendar size={14} className="text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{event.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {new Date(event.startTime).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {event.type && (
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 shrink-0">
                      {event.type.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Calendar size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Live Stream Banner ────────────────────────────────────────── */}
      {liveStream && (
        <Card className="bg-gradient-to-r from-red-500/15 to-zinc-900 border-red-500/30">
          <CardContent className="py-4 px-5 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-red-500/20 shrink-0">
              <Radio size={20} className="text-red-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0">LIVE</Badge>
                <span className="text-xs text-zinc-500">session in progress</span>
              </div>
              <p className="text-white font-semibold truncate">{liveStream.title}</p>
            </div>
            <Link href="/member/streaming" className="shrink-0">
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white gap-1.5">
                <Play size={12} />
                Join Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ── Active Challenges ────────────────────────────────────────── */}
      {(challengesData?.challenges ?? []).length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Trophy size={16} className="text-yellow-500" />
              Active Challenges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {challengesData!.challenges.slice(0, 3).map((challenge) => {
              const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
              return (
                <div key={challenge.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white truncate">{challenge.title}</p>
                    <span className="text-xs text-zinc-500 shrink-0 ml-2">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Motivation Row: Leaderboard Rank + Latest Badge ───────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Leaderboard rank */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Medal size={16} className="text-yellow-400" />
              Your Rank
            </CardTitle>
            <Link href="/member/leaderboard">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                Leaderboard <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {leaderboardData ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                  <span className="text-2xl font-black text-yellow-400">
                    #{leaderboardData.myRank ?? "—"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-semibold">{leaderboardData.myPoints} pts</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Keep training to climb the ranks</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 animate-pulse" />
                <div className="space-y-2">
                  <div className="w-20 h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="w-32 h-3 bg-zinc-800 rounded animate-pulse" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest badge */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Trophy size={16} className="text-purple-400" />
              Latest Badge
            </CardTitle>
            <Link href="/member/badges">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                All Badges <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {earnedBadges.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-2xl">
                  {earnedBadges[0].icon ?? "🏆"}
                </div>
                <div>
                  <p className="text-white font-semibold">{earnedBadges[0].title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{earnedBadges[0].description}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700">
                  <Trophy size={24} className="text-zinc-600" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">No badges yet</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Complete workouts to earn badges</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ───────────────────────────────────────────── */}
      {!sessionsLoading && (sessions ?? []).length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={18} className="text-orange-500" />
              Recent Activity
            </h2>
            <Link href="/member/activity">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white gap-1 text-xs">
                View All <ChevronRight size={12} />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {(sessions ?? []).slice(0, 4).map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 transition-colors">
                <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                  <Dumbbell size={15} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {s.workoutPlan?.title ?? "Workout Session"}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {s.duration > 0 ? `${s.duration} min` : "In progress"}
                    {s.forgeScore > 0 && ` · ${s.forgeScore} pts`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${s.completedAt ? "border-green-700/60 text-green-400" : "border-zinc-700 text-zinc-500"}`}
                  >
                    {s.completedAt ? "Done" : "Started"}
                  </Badge>
                  <p className="text-[11px] text-zinc-600">
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Community Feed Preview ────────────────────────────────────── */}
      {(communityFeedData?.posts ?? []).length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Users size={16} className="text-indigo-500" />
              Community Feed
            </CardTitle>
            <Link href="/member/community">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                View all <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {communityFeedData!.posts.map((post) => (
              <div key={post.id} className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-white">{post.author.fullName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{post.author.fullName}</p>
                    <p className="text-xs text-zinc-500">@{post.author.username}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-300 line-clamp-2 mb-2">{post.content}</p>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Heart size={12} />
                    {post._count.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {post._count.comments}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Recommendations: Explore Grid ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass size={18} className="text-teal-400" />
            Explore
          </h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {exploreCards.map((card) => (
            <Link key={card.label} href={card.href}>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all cursor-pointer group">
                <div className={`p-2.5 rounded-lg ${card.bg} group-hover:scale-110 transition-transform`}>
                  <card.icon size={17} className={card.color} />
                </div>
                <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 text-center leading-tight transition-colors">
                  {card.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Personalized Recommendations ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/member/workouts">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/15 transition-colors">
                  <Dumbbell size={18} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Suggested Workout</p>
                  <p className="text-[11px] text-zinc-500">Based on your goals</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Browse personalized workout plans tailored to your fitness level and goals.
              </p>
              <p className="text-[11px] text-orange-400 mt-2 flex items-center gap-1">
                Browse Workouts <ChevronRight size={10} />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/member/meals">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-green-500/10 group-hover:bg-green-500/15 transition-colors">
                  <UtensilsCrossed size={18} className="text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Meal Plans</p>
                  <p className="text-[11px] text-zinc-500">Fuel your performance</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Explore nutrition plans and track your meals to optimize your training results.
              </p>
              <p className="text-[11px] text-green-400 mt-2 flex items-center gap-1">
                View Meals <ChevronRight size={10} />
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/member/music">
          <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/15 transition-colors">
                  <Music size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Workout Playlists</p>
                  <p className="text-[11px] text-zinc-500">Stay in the zone</p>
                </div>
              </div>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Access curated workout playlists designed to keep your energy and focus high.
              </p>
              <p className="text-[11px] text-blue-400 mt-2 flex items-center gap-1">
                Open Music <ChevronRight size={10} />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  );
}
