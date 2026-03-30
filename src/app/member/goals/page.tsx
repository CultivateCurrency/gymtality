"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  TrendingUp,
  Dumbbell,
  Heart,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";

const GOAL_TYPES = [
  { value: "weight", label: "Weight", icon: TrendingUp, color: "text-blue-500" },
  { value: "strength", label: "Strength", icon: Dumbbell, color: "text-orange-500" },
  { value: "cardio", label: "Cardio", icon: Heart, color: "text-red-500" },
  { value: "custom", label: "Custom", icon: Zap, color: "text-purple-500" },
];

interface Goal {
  id: string;
  type: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  targetDate: string | null;
  createdAt: string;
}

interface GoalsResponse {
  goals: Goal[];
}

export default function GoalsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formType, setFormType] = useState("weight");
  const [formTitle, setFormTitle] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formUnit, setFormUnit] = useState("lbs");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formCurrentValue, setFormCurrentValue] = useState("");

  const { data, loading, error, refetch } = useApi<GoalsResponse>("/api/goals");
  const goals = data?.goals ?? [];

  const resetForm = () => {
    setFormType("weight");
    setFormTitle("");
    setFormTarget("");
    setFormUnit("lbs");
    setFormTargetDate("");
    setFormCurrentValue("");
    setEditingGoal(null);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formTarget) return;
    try {
      if (editingGoal) {
        await apiFetch(`/api/goals/${editingGoal.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: formTitle,
            type: formType,
            target: parseFloat(formTarget),
            current: parseFloat(formCurrentValue || "0"),
            unit: formUnit,
            targetDate: formTargetDate || null,
          }),
        });
      } else {
        await apiFetch("/api/goals", {
          method: "POST",
          body: JSON.stringify({
            title: formTitle,
            type: formType,
            target: parseFloat(formTarget),
            current: parseFloat(formCurrentValue || "0"),
            unit: formUnit,
            targetDate: formTargetDate || null,
          }),
        });
      }
      resetForm();
      setDialogOpen(false);
      refetch();
      toast.success(editingGoal ? "Goal updated" : "Goal created");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save goal");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      refetch();
      toast.success("Goal deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete goal");
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormType(goal.type);
    setFormTitle(goal.title);
    setFormTarget(goal.target.toString());
    setFormUnit(goal.unit);
    setFormCurrentValue(goal.current.toString());
    setFormTargetDate(goal.targetDate ? goal.targetDate.split("T")[0] : "");
    setDialogOpen(true);
  };

  const getProgress = (goal: Goal) => {
    if (goal.target === 0) return 0;
    return Math.min(100, Math.round((goal.current / goal.target) * 100));
  };

  const getGoalIcon = (type: string) => {
    const found = GOAL_TYPES.find((g) => g.value === type);
    return found || GOAL_TYPES[3];
  };

  // Stats for previous weeks
  const completedGoals = goals.filter((g) => g.current >= g.target).length;
  const inProgressGoals = goals.filter((g) => g.current < g.target).length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + getProgress(g), 0) / goals.length)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Target className="h-8 w-8 text-orange-500" />
            Goals
          </h1>
          <p className="text-zinc-400 mt-1">Set and track your fitness goals</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingGoal ? "Edit Goal" : "Create New Goal"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Goal Type Selection */}
              <div>
                <p className="text-sm text-zinc-400 mb-2">Goal Type</p>
                <div className="grid grid-cols-4 gap-2">
                  {GOAL_TYPES.map((gt) => (
                    <button
                      key={gt.value}
                      onClick={() => setFormType(gt.value)}
                      className={`p-3 rounded-lg border text-center transition ${
                        formType === gt.value
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-zinc-700 hover:border-zinc-600"
                      }`}
                    >
                      <gt.icon className={`h-5 w-5 mx-auto mb-1 ${gt.color}`} />
                      <span className="text-xs text-zinc-300">{gt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                placeholder="Goal title (e.g., Lose 10 lbs)"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400">Target Value</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Unit</label>
                  <Input
                    placeholder="lbs, reps, miles..."
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400">Current Progress</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formCurrentValue}
                  onChange={(e) => setFormCurrentValue(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400">Target Date (optional)</label>
                <Input
                  type="date"
                  value={formTargetDate}
                  onChange={(e) => setFormTargetDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white mt-1"
                />
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSubmit}
              >
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{completedGoals}</p>
                <p className="text-sm text-zinc-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{inProgressGoals}</p>
                <p className="text-sm text-zinc-400">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{avgProgress}%</p>
                <p className="text-sm text-zinc-400">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <p className="text-red-400">Failed to load goals. Please try again.</p>
        </div>
      )}

      {/* Goals List */}
      {!loading && !error && goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No goals yet. Create your first fitness goal!</p>
        </div>
      )}

      {!loading && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = getProgress(goal);
            const goalType = getGoalIcon(goal.type);
            const GoalIcon = goalType.icon;
            const isComplete = progress >= 100;

            return (
              <Card
                key={goal.id}
                className={`bg-zinc-900 border-zinc-800 ${isComplete ? "border-green-500/30" : ""}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${isComplete ? "bg-green-500/20" : "bg-zinc-800"}`}>
                      <GoalIcon className={`h-6 w-6 ${isComplete ? "text-green-500" : goalType.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{goal.title}</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(goal)}
                            className="p-1.5 text-zinc-500 hover:text-white transition rounded-lg hover:bg-zinc-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition rounded-lg hover:bg-zinc-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">
                        {goal.current} / {goal.target} {goal.unit}
                        {goal.targetDate && (
                          <span className="ml-2">
                            -- Due {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                      </p>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">{progress}% complete</span>
                          {isComplete && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Done
                            </span>
                          )}
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isComplete ? "bg-green-500" : "bg-orange-500"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
