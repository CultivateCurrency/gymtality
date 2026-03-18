"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Users,
  Calendar,
  Radio,
  Music,
  ShoppingBag,
  BookOpen,
  Flame,
  TrendingUp,
  Clock,
  Trophy,
  Heart,
  Salad,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useSession } from "next-auth/react";

const categories = [
  { label: "Workouts", href: "/member/workouts", icon: Dumbbell, color: "text-orange-500" },
  { label: "Meditation", href: "/member/workouts?cat=meditation", icon: Heart, color: "text-purple-500" },
  { label: "Yoga", href: "/member/workouts?cat=yoga", icon: Heart, color: "text-cyan-500" },
  { label: "Healthy Foods", href: "/member/workouts?cat=food", icon: Salad, color: "text-green-500" },
  { label: "Books", href: "/member/workouts?cat=books", icon: BookOpen, color: "text-amber-500" },
  { label: "Merchandise", href: "/member/shop", icon: ShoppingBag, color: "text-pink-500" },
  { label: "Music", href: "/member/music", icon: Music, color: "text-blue-500" },
  { label: "Community", href: "/member/community", icon: Users, color: "text-indigo-500" },
];

interface Session {
  id: string;
  completedAt: string | null;
  createdAt: string;
}

interface SessionsResponse {
  sessions: Session[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

interface EventsResponse {
  events: Array<{ id: string; title: string; startTime: string }>;
  pagination: any;
}

interface StreamsResponse {
  streams: Array<{ id: string; title: string; status: string }>;
}

export default function MemberDashboard() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const userId = user?.id;

  const { data: sessionsData, loading: sessionsLoading } = useApi<SessionsResponse>(
    userId ? `/api/workouts/sessions?userId=${userId}&limit=100` : null
  );
  const { data: eventsData, loading: eventsLoading } = useApi<EventsResponse>(
    "/api/events?upcoming=true&limit=1"
  );
  const { data: streamsData } = useApi<StreamsResponse>(
    "/api/streaming?status=LIVE&limit=1"
  );

  const stats = useMemo(() => {
    const sessions = sessionsData?.sessions ?? [];
    const totalWorkouts = sessions.filter((s) => s.completedAt).length;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const workoutsThisWeek = sessions.filter(
      (s) => s.completedAt && new Date(s.completedAt) >= startOfWeek
    ).length;

    // Calculate streak — consecutive days with completed sessions
    let streak = 0;
    if (sessions.length > 0) {
      const completedDates = new Set(
        sessions
          .filter((s) => s.completedAt)
          .map((s) => new Date(s.completedAt!).toDateString())
      );
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        if (completedDates.has(checkDate.toDateString())) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
    }

    return { totalWorkouts, workoutsThisWeek, streak };
  }, [sessionsData]);

  const nextEvent = eventsData?.events?.[0] ?? null;
  const liveStream = streamsData?.streams?.[0] ?? null;
  const userName = user?.name?.split(" ")[0] || "";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome Back{userName ? `, ${userName}` : ""}!
        </h1>
        <p className="text-zinc-400 mt-1">Here&apos;s your fitness overview for today.</p>
      </div>

      {/* Today Screen — Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/20 to-zinc-900 border-orange-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${sessionsLoading ? "animate-pulse" : ""}`}>
                  {sessionsLoading ? "—" : stats.streak}
                </p>
                <p className="text-sm text-zinc-400">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Dumbbell className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-2xl font-bold text-white ${sessionsLoading ? "animate-pulse" : ""}`}>
                  {sessionsLoading ? "—" : stats.workoutsThisWeek}
                </p>
                <p className="text-sm text-zinc-400">Workouts This Week</p>
              </div>
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
                <p className={`text-2xl font-bold text-white ${sessionsLoading ? "animate-pulse" : ""}`}>
                  {sessionsLoading ? "—" : stats.totalWorkouts}
                </p>
                <p className="text-sm text-zinc-400">Total Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-zinc-400">Forge Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Workout */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Today&apos;s Workout
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Complete your questionnaire to get a personalized plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/member/questionnaire">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Complete Fitness Questionnaire
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Upcoming Event */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            Next Event
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {eventsLoading
              ? "Loading upcoming events..."
              : nextEvent
                ? `${nextEvent.title} — ${new Date(nextEvent.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
                : "No upcoming events. Browse the calendar to book a class."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/member/events">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Browse Events
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Category Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.label} href={cat.href}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-colors cursor-pointer group h-full">
                <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="p-3 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                    <cat.icon className={`h-8 w-8 ${cat.color}`} />
                  </div>
                  <span className="font-medium text-zinc-300 group-hover:text-white">
                    {cat.label}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Now */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Radio className={`h-5 w-5 ${liveStream ? "text-red-500 animate-pulse" : "text-red-500"}`} />
            {liveStream ? "LIVE NOW" : "Live Now"}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {liveStream
              ? liveStream.title
              : "No live sessions right now. Check back later or browse upcoming events."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/member/streaming">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              {liveStream ? "Join Stream" : "Browse Streams"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
