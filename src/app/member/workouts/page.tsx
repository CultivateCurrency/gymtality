"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Home,
  Search,
  Filter,
  Heart,
  Bookmark,
  Clock,
  User,
  Play,
  Loader2,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";

const FILTERS = ["All", "Home", "Gym", "Strength", "Cardio", "Yoga", "Meditation", "Mentality"];
const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Core", "Shoulders", "Full Body"];

interface WorkoutsResponse {
  plans: Array<{
    id: string;
    name: string;
    type: string;
    category: string | null;
    difficulty: string | null;
    coverImage: string | null;
    coach: { id: string; fullName: string; username: string; profilePhoto: string | null };
    _count: { likes: number; saves: number; sessions: number };
  }>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function WorkoutsPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filterParam =
    activeFilter === "Home" ? "&type=HOME"
    : activeFilter === "Gym" ? "&type=GYM"
    : activeFilter !== "All" ? `&category=${activeFilter}`
    : "";

  const url = `/api/workouts?page=1&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}${filterParam}`;
  const { data, loading, error } = useApi<WorkoutsResponse>(url);

  const plans = data?.plans ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workouts</h1>
          <p className="text-zinc-400 mt-1">Browse and start workout plans</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeFilter === filter
                ? "bg-orange-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Body Parts Filter (expandable) */}
      {showFilters && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-zinc-300 mb-3">Target Body Parts</p>
            <div className="flex gap-2 flex-wrap">
              {BODY_PARTS.map((part) => (
                <Badge
                  key={part}
                  variant="outline"
                  className="border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-500 cursor-pointer"
                >
                  {part}
                </Badge>
              ))}
            </div>
            <p className="text-sm font-medium text-zinc-300 mb-3 mt-4">Equipment Required</p>
            <div className="flex gap-2 flex-wrap">
              {["None", "Dumbbells", "Barbell", "Resistance Bands", "Kettlebell", "Machine"].map((eq) => (
                <Badge
                  key={eq}
                  variant="outline"
                  className="border-zinc-700 text-zinc-400 hover:border-orange-500 hover:text-orange-500 cursor-pointer"
                >
                  {eq}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load workouts. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && plans.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No workouts found. Try a different search or filter.</p>
        </div>
      )}

      {/* Workout Plan Grid */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Link key={plan.id} href={`/member/workouts/${plan.id}`}>
              <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition-all cursor-pointer group overflow-hidden h-full">
                {/* Cover Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center relative">
                  {plan.coverImage ? (
                    <img src={plan.coverImage} alt={plan.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dumbbell className="h-12 w-12 text-zinc-700" />
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`text-xs ${
                        plan.type === "HOME"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {plan.type === "HOME" ? (
                        <><Home className="h-3 w-3 mr-1" /> Home</>
                      ) : (
                        <><Dumbbell className="h-3 w-3 mr-1" /> Gym</>
                      )}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                    <div className="bg-orange-500 rounded-full p-2">
                      <Play className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>

                <CardContent className="pt-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-orange-500 transition">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-zinc-400 flex items-center gap-1 mt-1">
                      <User className="h-3 w-3" />
                      {plan.coach.fullName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3 w-3" />
                      {plan._count.sessions} sessions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {plan.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {plan.category && (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                        {plan.category}
                      </Badge>
                    )}
                    {plan.difficulty && (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                        {plan.difficulty}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-zinc-800 text-zinc-500 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" /> {plan._count.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="h-3.5 w-3.5" /> {plan._count.saves}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
