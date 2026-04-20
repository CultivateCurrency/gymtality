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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Sparkles,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";

const FILTERS = ["All", "Home", "Gym", "Strength", "Cardio", "Yoga", "Meditation", "Mentality"];
const BODY_PARTS = ["Chest", "Back", "Legs", "Arms", "Core", "Shoulders", "Full Body"];

interface WorkoutsResponse {
  plans: Array<{
    id: string;
    name: string;
    type: string;
    category: string | null;
    difficulty: string | null;
    durationMinutes: number | null;
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
  const [page, setPage] = useState(1);
  const [allPlans, setAllPlans] = useState<WorkoutsResponse["plans"]>([]);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [aiPlanType, setAIPlanType] = useState<"GYM" | "HOME">("GYM");
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  const filterParam =
    activeFilter === "Home" ? "&type=HOME"
    : activeFilter === "Gym" ? "&type=GYM"
    : activeFilter !== "All" ? `&category=${activeFilter}`
    : "";

  const url = `/api/workouts?page=${page}&limit=20${search ? `&search=${encodeURIComponent(search)}` : ""}${filterParam}`;
  const { data, loading, error } = useApi<WorkoutsResponse>(url);

  // Reset to page 1 when search or filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
    setAllPlans([]);
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
    setAllPlans([]);
  };

  // Append new results to existing plans
  if (data && data.plans) {
    if (page === 1) {
      setAllPlans(data.plans);
    } else if (allPlans.length > 0 && data.plans.length > 0) {
      const isNewData = !allPlans.some(p => p.id === data.plans[0].id);
      if (isNewData) {
        setAllPlans([...allPlans, ...data.plans]);
      }
    }
  }

  const plans = page === 1 ? (data?.plans ?? []) : allPlans;
  const pagination = data?.pagination;
  const hasMore = pagination && page < pagination.totalPages;

  const handleGenerateAIPlan = async () => {
    setGeneratingAI(true);
    try {
      const response = await apiFetch("/api/ai/workout-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: aiPlanType, daysPerWeek: 3 }),
      });
      if (response?.success) {
        setGeneratedPlan(response.data);
        toast.success("AI plan generated!");
      } else {
        toast.error(response?.error || "Failed to generate plan");
      }
    } catch (err) {
      toast.error("Error generating plan");
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveAIPlan = async () => {
    if (!generatedPlan) return;
    setSavingPlan(true);
    try {
      const response = await apiFetch("/api/ai/workout-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedPlan),
      });
      if (response?.success) {
        toast.success("Plan saved! Check your plans.");
        setAIDialogOpen(false);
        setGeneratedPlan(null);
      } else {
        toast.error(response?.error || "Failed to save plan");
      }
    } catch (err) {
      toast.error("Error saving plan");
      console.error(err);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workouts</h1>
          <p className="text-zinc-400 mt-1">Browse and start workout plans</p>
        </div>
        <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
          <DialogTrigger>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Generate Your Workout Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={aiPlanType === "GYM" ? "default" : "outline"}
                  onClick={() => setAIPlanType("GYM")}
                  className="flex-1"
                >
                  Gym
                </Button>
                <Button
                  variant={aiPlanType === "HOME" ? "default" : "outline"}
                  onClick={() => setAIPlanType("HOME")}
                  className="flex-1"
                >
                  Home
                </Button>
              </div>
              {!generatedPlan ? (
                <Button
                  onClick={handleGenerateAIPlan}
                  disabled={generatingAI}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Plan"
                  )}
                </Button>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="text-white font-semibold mb-2">{generatedPlan.name}</h3>
                    <p className="text-zinc-400 text-sm">{generatedPlan.description}</p>
                  </div>
                  <Button
                    onClick={handleSaveAIPlan}
                    disabled={savingPlan}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {savingPlan ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save This Plan"
                    )}
                  </Button>
                  <Button
                    onClick={() => setGeneratedPlan(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Generate Another
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search workouts..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
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
            onClick={() => handleFilterChange(filter)}
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
        <>
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
                      {plan.durationMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {plan.durationMinutes} min
                        </span>
                      )}
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

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More Workouts"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
