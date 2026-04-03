"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Dumbbell, DollarSign, Star, Calendar, Upload,
  Radio, TrendingUp, Clock, ChevronRight, AlertCircle,
  MessageSquare, Play, Zap,
} from "lucide-react";

interface DashboardData {
  stats: {
    activeClients: number;
    workoutPlans: number;
    monthlyEarnings: number;
  };
  upcomingEvents: { id: string; title: string; date: string; type: string }[];
  recentStreams: { id: string; title: string; date: string; viewers: number }[];
}

const quickActions = [
  { label: "Upload Content", desc: "Plans, videos, exercises", href: "/coach/content", icon: Upload, color: "text-orange-400", bg: "bg-orange-500/10", border: "hover:border-orange-500/40" },
  { label: "Go Live", desc: "Start a livestream class", href: "/coach/streaming", icon: Radio, color: "text-red-400", bg: "bg-red-500/10", border: "hover:border-red-500/40" },
  { label: "My Clients", desc: "Notes, sessions, progress", href: "/coach/clients", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/40" },
  { label: "Schedule", desc: "Availability & bookings", href: "/coach/schedule", icon: Calendar, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/40" },
  { label: "Earnings", desc: "Donations & payouts", href: "/coach/earnings", icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "hover:border-green-500/40" },
  { label: "Messages", desc: "Chat with clients", href: "/coach/messages", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10", border: "hover:border-purple-500/40" },
];

export default function CoachDashboard() {
  const { user } = useAuthStore();
  const { data, loading } = useApi<DashboardData>("/api/coach/dashboard");

  const firstName = user?.fullName?.split(" ")[0] || "Coach";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const kpis = [
    { label: "Active Clients", value: data?.stats.activeClients ?? 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", gradient: "from-blue-500/10" },
    { label: "Workout Plans", value: data?.stats.workoutPlans ?? 0, icon: Dumbbell, color: "text-orange-400", bg: "bg-orange-500/10", gradient: "" },
    { label: "Earnings This Month", value: `$${data?.stats.monthlyEarnings ?? 0}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", gradient: "from-green-500/10" },
    { label: "Avg Rating", value: "—", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10", gradient: "" },
  ];

  const upcomingEvents = data?.upcomingEvents ?? [];
  const recentStreams = data?.recentStreams ?? [];

  return (
    <div className="space-y-8">

      {/* ── Hero: Welcome ──────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/10 border border-zinc-800/60 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-zinc-500 text-xs">{today}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">Here's your coaching command center.</p>
          </div>
          <Link href="/coach/streaming">
            <Button className="bg-red-500 hover:bg-red-600 text-white gap-2 shrink-0">
              <Play size={14} />
              Go Live
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label} className={`border-zinc-800 ${k.gradient ? `bg-gradient-to-br ${k.gradient} to-zinc-900` : "bg-zinc-900"}`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${k.bg} shrink-0`}>
                  <k.icon size={18} className={k.color} />
                </div>
                <div>
                  <p className={`text-2xl font-bold text-white ${loading ? "opacity-30 animate-pulse" : ""}`}>
                    {loading ? "—" : k.value}
                  </p>
                  <p className="text-xs text-zinc-500">{k.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Alert: Pending actions ─────────────────────────────────────── */}
      {!loading && data?.stats.activeClients === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
          <AlertCircle size={16} className="text-amber-400 shrink-0" />
          <p className="text-amber-300">
            No active clients yet.{" "}
            <Link href="/coach/content" className="underline underline-offset-2 hover:text-white">
              Upload your first workout plan
            </Link>{" "}
            to get discovered.
          </p>
        </div>
      )}

      {/* ── Quick Actions Grid ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 ${a.border} transition-all cursor-pointer group text-center`}>
                <div className={`p-2.5 rounded-lg ${a.bg} group-hover:scale-110 transition-transform`}>
                  <a.icon size={18} className={a.color} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-tight">{a.label}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight hidden md:block">{a.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Two-column: Upcoming Events + Recent Streams ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upcoming Events */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Calendar size={15} className="text-cyan-400" />
              Upcoming Events
            </CardTitle>
            <Link href="/coach/schedule">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                View all <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />)}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0">
                      <Calendar size={13} className="text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{e.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(e.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 shrink-0">
                      {e.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No upcoming events</p>
                <Link href="/coach/schedule">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white mt-3 h-8 text-xs">
                    Set Availability
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Streams / Performance */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <TrendingUp size={15} className="text-green-400" />
              Recent Streams
            </CardTitle>
            <Link href="/coach/streaming">
              <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white text-xs h-7 gap-1">
                View all <ChevronRight size={12} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-12 bg-zinc-800 rounded-lg animate-pulse" />)}
              </div>
            ) : recentStreams.length > 0 ? (
              <div className="space-y-2">
                {recentStreams.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800">
                    <div className="p-2 rounded-lg bg-red-500/10 shrink-0">
                      <Radio size={13} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
                      <Zap size={11} className="text-yellow-400" />
                      {s.viewers} viewers
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Radio size={28} className="text-zinc-700 mx-auto mb-2" />
                <p className="text-zinc-500 text-sm">No streams yet</p>
                <Link href="/coach/streaming">
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white mt-3 h-8 text-xs">
                    Start Streaming
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Tips row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10", title: "Consistency wins", body: "Coaches who post weekly plans see 3× more client retention." },
          { icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", title: "Grow your audience", body: "Go live at least once a week to attract new members to your profile." },
          { icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", title: "Enable donations", body: "Members can tip you after a great class — make sure donations are on." },
        ].map((t) => (
          <div key={t.title} className="flex gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <div className={`p-2 rounded-lg ${t.bg} h-fit shrink-0`}>
              <t.icon size={15} className={t.color} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{t.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{t.body}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
