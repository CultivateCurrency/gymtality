"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Flame,
  Dumbbell,
  Target,
  Users,
  Calendar,
  Music,
  Zap,
  Star,
  Award,
  Crown,
  Heart,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  totalPoints: number;
  eventsAttended: number;
  postsCreated: number;
  goalsCompleted: number;
}

const BADGES = [
  { id: "first-workout", name: "First Rep", desc: "Complete your first workout", icon: Dumbbell, color: "blue", requirement: (s: UserStats) => s.totalWorkouts >= 1 },
  { id: "five-workouts", name: "Getting Started", desc: "Complete 5 workouts", icon: Dumbbell, color: "green", requirement: (s: UserStats) => s.totalWorkouts >= 5 },
  { id: "twenty-five-workouts", name: "Dedicated", desc: "Complete 25 workouts", icon: Dumbbell, color: "purple", requirement: (s: UserStats) => s.totalWorkouts >= 25 },
  { id: "fifty-workouts", name: "Iron Will", desc: "Complete 50 workouts", icon: Trophy, color: "orange", requirement: (s: UserStats) => s.totalWorkouts >= 50 },
  { id: "hundred-workouts", name: "Centurion", desc: "Complete 100 workouts", icon: Crown, color: "amber", requirement: (s: UserStats) => s.totalWorkouts >= 100 },
  { id: "streak-3", name: "On Fire", desc: "3-day workout streak", icon: Flame, color: "red", requirement: (s: UserStats) => s.currentStreak >= 3 },
  { id: "streak-7", name: "Week Warrior", desc: "7-day workout streak", icon: Flame, color: "orange", requirement: (s: UserStats) => s.currentStreak >= 7 },
  { id: "streak-30", name: "Unstoppable", desc: "30-day workout streak", icon: Flame, color: "yellow", requirement: (s: UserStats) => s.currentStreak >= 30 },
  { id: "first-event", name: "Social Butterfly", desc: "Attend your first event", icon: Calendar, color: "cyan", requirement: (s: UserStats) => s.eventsAttended >= 1 },
  { id: "five-events", name: "Regular", desc: "Attend 5 events", icon: Calendar, color: "teal", requirement: (s: UserStats) => s.eventsAttended >= 5 },
  { id: "first-post", name: "Voice Heard", desc: "Create your first community post", icon: Users, color: "indigo", requirement: (s: UserStats) => s.postsCreated >= 1 },
  { id: "first-goal", name: "Goal Setter", desc: "Complete your first goal", icon: Target, color: "emerald", requirement: (s: UserStats) => s.goalsCompleted >= 1 },
  { id: "points-100", name: "Rising Star", desc: "Earn 100 Gymtality Points", icon: Zap, color: "blue", requirement: (s: UserStats) => s.totalPoints >= 100 },
  { id: "points-500", name: "All-Star", desc: "Earn 500 Gymtality Points", icon: Star, color: "purple", requirement: (s: UserStats) => s.totalPoints >= 500 },
  { id: "points-1000", name: "Legend", desc: "Earn 1,000 Gymtality Points", icon: Award, color: "orange", requirement: (s: UserStats) => s.totalPoints >= 1000 },
  { id: "community-lover", name: "Community Lover", desc: "Create 10 posts", icon: Heart, color: "pink", requirement: (s: UserStats) => s.postsCreated >= 10 },
];

export default function BadgesPage() {
  const { data: stats, loading } = useApi<UserStats>("/api/users/me/stats");

  const userStats: UserStats = stats || {
    totalWorkouts: 0,
    currentStreak: 0,
    totalPoints: 0,
    eventsAttended: 0,
    postsCreated: 0,
    goalsCompleted: 0,
  };

  const earned = BADGES.filter((b) => b.requirement(userStats));
  const locked = BADGES.filter((b) => !b.requirement(userStats));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Badges & Achievements</h1>
        <p className="text-zinc-400 mt-1">Track your milestones and unlock badges as you progress.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Workouts", value: userStats.totalWorkouts, icon: Dumbbell },
          { label: "Streak", value: `${userStats.currentStreak}d`, icon: Flame },
          { label: "Points", value: userStats.totalPoints, icon: Zap },
          { label: "Events", value: userStats.eventsAttended, icon: Calendar },
          { label: "Posts", value: userStats.postsCreated, icon: Users },
          { label: "Goals", value: userStats.goalsCompleted, icon: Target },
        ].map((stat) => (
          <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 text-center">
              <stat.icon className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-zinc-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-zinc-300">Badges Earned</p>
            <p className="text-sm font-bold text-orange-500">{earned.length} / {BADGES.length}</p>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
              style={{ width: `${(earned.length / BADGES.length) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Earned ({earned.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {earned.map((badge) => (
              <Card key={badge.id} className="bg-zinc-900 border-orange-500/30 hover:border-orange-500/60 transition">
                <CardContent className="pt-6 text-center">
                  <div className={`w-14 h-14 rounded-full bg-${badge.color}-500/20 flex items-center justify-center mx-auto mb-3`}>
                    <badge.icon className={`h-7 w-7 text-${badge.color}-400`} />
                  </div>
                  <p className="font-semibold text-white text-sm">{badge.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{badge.desc}</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30 text-xs">Earned</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-zinc-500" />
            Locked ({locked.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {locked.map((badge) => (
              <Card key={badge.id} className="bg-zinc-900 border-zinc-800 opacity-60">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <badge.icon className="h-7 w-7 text-zinc-600" />
                  </div>
                  <p className="font-semibold text-zinc-400 text-sm">{badge.name}</p>
                  <p className="text-xs text-zinc-600 mt-1">{badge.desc}</p>
                  <Badge className="mt-2 bg-zinc-800 text-zinc-500 border-zinc-700 text-xs">Locked</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
