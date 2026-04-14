"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Flame, Dumbbell, Zap, Loader2, Crown, Medal } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";

type LeaderboardType = "points" | "workouts" | "streak";

interface LeaderboardEntry {
  id: string;
  fullName: string;
  username: string;
  profilePhoto: string | null;
  rank: number;
  value: number;
  label: string;
}

const TABS: { key: LeaderboardType; label: string; icon: typeof Trophy }[] = [
  { key: "points", label: "Points", icon: Zap },
  { key: "workouts", label: "Workouts", icon: Dumbbell },
  { key: "streak", label: "Streaks", icon: Flame },
];

const RANK_STYLES: Record<number, string> = {
  1: "text-amber-400",
  2: "text-zinc-300",
  3: "text-amber-700",
};

export default function LeaderboardPage() {
  const [type, setType] = useState<LeaderboardType>("points");
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data, loading } = useApi<LeaderboardEntry[]>(`/api/misc/leaderboard?type=${type}`);
  const entries = data ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="text-zinc-400 mt-1">See how you rank against other members.</p>
      </div>

      {/* Type Toggle */}
      <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setType(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition ${
              type === tab.key
                ? "bg-orange-500 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium */}
      {!loading && entries.length >= 3 && (
        <div className="flex items-end justify-center gap-4 py-6">
          {[entries[1], entries[0], entries[2]].map((entry, i) => {
            const podiumHeight = i === 1 ? "h-28" : i === 0 ? "h-20" : "h-16";
            const rank = entry.rank;
            return (
              <div key={entry.id} className="flex flex-col items-center gap-2">
                <Avatar className={`${rank === 1 ? "h-16 w-16 ring-2 ring-amber-400" : "h-12 w-12"}`}>
                  {entry.profilePhoto ? (
                    <img src={entry.profilePhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-zinc-700 text-zinc-300">
                      {entry.fullName.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <p className="text-sm font-medium text-white text-center truncate max-w-[80px]">{entry.fullName.split(" ")[0]}</p>
                <p className="text-xs text-orange-400 font-bold">{entry.value.toLocaleString()} {entry.label}</p>
                <div className={`${podiumHeight} w-20 rounded-t-lg flex items-start justify-center pt-2 ${
                  rank === 1 ? "bg-amber-500/20" : rank === 2 ? "bg-zinc-500/20" : "bg-amber-700/20"
                }`}>
                  {rank === 1 ? <Crown className="h-6 w-6 text-amber-400" /> :
                   rank === 2 ? <Medal className="h-5 w-5 text-zinc-300" /> :
                   <Medal className="h-5 w-5 text-amber-700" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">No data yet. Start working out to appear on the leaderboard!</p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition ${
                    entry.id === userId ? "bg-orange-500/10 border border-orange-500/30" : "hover:bg-zinc-800"
                  }`}
                >
                  <span className={`text-lg font-bold w-8 text-center ${RANK_STYLES[entry.rank] || "text-zinc-500"}`}>
                    {entry.rank}
                  </span>
                  <Avatar className="h-9 w-9">
                    {entry.profilePhoto ? (
                      <img src={entry.profilePhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-zinc-700 text-zinc-300 text-sm">
                        {entry.fullName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {entry.fullName}
                      {entry.id === userId && <span className="text-orange-400 text-xs ml-2">(You)</span>}
                    </p>
                    <p className="text-xs text-zinc-500">@{entry.username}</p>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{entry.value.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{entry.label}</span></span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
