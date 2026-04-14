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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Dumbbell,
  Apple,
  TrendingUp,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";

interface WorkoutPlan {
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    duration?: string;
  }>;
  duration: number;
  difficulty: string;
  notes: string;
}

interface MealPlan {
  meals: Array<{
    name: string;
    macros: { protein: number; carbs: number; fats: number };
    calories: number;
  }>;
  totalCalories: number;
  notes: string;
}

interface ProgressInsight {
  summary: string;
  achievements: string[];
  recommendations: string[];
  nextMilestone: string;
}

export default function AICoachPage() {
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState(3);
  const [workoutType, setWorkoutType] = useState<"GYM" | "HOME">("GYM");
  const [workoutFocus, setWorkoutFocus] = useState("Full Body");
  const [generatingWorkout, setGeneratingWorkout] = useState(false);
  const [workoutResult, setWorkoutResult] = useState<WorkoutPlan | null>(null);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);

  const [mealGoal, setMealGoal] = useState("Muscle Gain");
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [generatingMeal, setGeneratingMeal] = useState(false);
  const [mealResult, setMealResult] = useState<MealPlan | null>(null);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);

  const [generatingInsight, setGeneratingInsight] = useState(false);
  const [insightResult, setInsightResult] = useState<ProgressInsight | null>(null);
  const [insightDialogOpen, setInsightDialogOpen] = useState(false);

  const [autoCheckIn, setAutoCheckIn] = useState(false);
  const [autoWeeklyReport, setAutoWeeklyReport] = useState(false);

  const handleGenerateWorkout = async () => {
    setGeneratingWorkout(true);
    try {
      const data = await apiFetch<WorkoutPlan>("/api/ai/workout-plan", {
        method: "POST",
        body: JSON.stringify({
          daysPerWeek: workoutDaysPerWeek,
          type: workoutType,
          focus: workoutFocus,
        }),
      });
      setWorkoutResult(data);
      setWorkoutDialogOpen(true);
      toast.success("Workout plan generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate workout plan");
    }
    setGeneratingWorkout(false);
  };

  const handleSaveWorkout = async () => {
    if (!workoutResult) return;
    try {
      await apiFetch("/api/ai/workout-plan/save", {
        method: "POST",
        body: JSON.stringify(workoutResult),
      });
      toast.success("Workout plan saved to your library!");
      setWorkoutDialogOpen(false);
      setWorkoutResult(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save workout plan");
    }
  };

  const handleGenerateMealPlan = async () => {
    setGeneratingMeal(true);
    try {
      const data = await apiFetch<MealPlan>("/api/ai/meal-plan", {
        method: "POST",
        body: JSON.stringify({
          goal: mealGoal,
          restrictions: dietaryRestrictions || null,
        }),
      });
      setMealResult(data);
      setMealDialogOpen(true);
      toast.success("Meal plan generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate meal plan");
    }
    setGeneratingMeal(false);
  };

  const handleSaveMealPlan = async () => {
    if (!mealResult) return;
    try {
      await apiFetch("/api/ai/meal-plan/save", {
        method: "POST",
        body: JSON.stringify(mealResult),
      });
      toast.success("Meal plan saved!");
      setMealDialogOpen(false);
      setMealResult(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save meal plan");
    }
  };

  const handleGenerateInsight = async () => {
    setGeneratingInsight(true);
    try {
      const data = await apiFetch<ProgressInsight>("/api/ai/progress-insight", {
        method: "POST",
      });
      setInsightResult(data);
      setInsightDialogOpen(true);
      toast.success("Progress insight generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate progress insight");
    }
    setGeneratingInsight(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-orange-500" />
          AI Fitness Coach
        </h1>
        <p className="text-zinc-400 mt-2">Personalized AI-generated workout plans, meal plans, and progress insights</p>
      </div>

      {/* Workout Generator */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-orange-500" />
            Generate Workout Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Workout Location</label>
              <div className="flex gap-2">
                {(["GYM", "HOME"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setWorkoutType(type)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      workoutType === type
                        ? "bg-orange-500 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    {type === "GYM" ? "🏋️ Gym" : "🏠 Home"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Days Per Week</label>
              <Input
                type="number"
                min={1}
                max={7}
                value={workoutDaysPerWeek}
                onChange={(e) => setWorkoutDaysPerWeek(Math.max(1, Math.min(7, parseInt(e.target.value) || 1)))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">Training Focus</label>
            <select
              value={workoutFocus}
              onChange={(e) => setWorkoutFocus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
            >
              <option>Full Body</option>
              <option>Upper Body</option>
              <option>Lower Body</option>
              <option>Chest & Triceps</option>
              <option>Back & Biceps</option>
              <option>Legs & Glutes</option>
              <option>Strength</option>
              <option>Cardio</option>
              <option>Flexibility</option>
            </select>
          </div>

          <Button
            onClick={handleGenerateWorkout}
            disabled={generatingWorkout}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {generatingWorkout ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Workout Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Meal Plan Generator */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Apple className="h-5 w-5 text-orange-500" />
            Generate Meal Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Fitness Goal</label>
              <select
                value={mealGoal}
                onChange={(e) => setMealGoal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
              >
                <option>Muscle Gain</option>
                <option>Fat Loss</option>
                <option>Maintenance</option>
                <option>Athletic Performance</option>
                <option>Endurance</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Dietary Restrictions (optional)</label>
              <Input
                placeholder="e.g., Vegetarian, Gluten-free"
                value={dietaryRestrictions}
                onChange={(e) => setDietaryRestrictions(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerateMealPlan}
            disabled={generatingMeal}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {generatingMeal ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Insights */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Get Progress Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-400 mb-4">
            Get personalized recommendations based on your recent workouts and progress
          </p>
          <Button
            onClick={handleGenerateInsight}
            disabled={generatingInsight}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {generatingInsight ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Automation & Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={autoCheckIn}
                onChange={(e) => setAutoCheckIn(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-orange-400 transition">
                  Daily Check-in Reminders
                </p>
                <p className="text-xs text-zinc-500">Get daily reminders to log your workouts and progress</p>
              </div>
              {autoCheckIn && <Check className="h-4 w-4 text-green-400" />}
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={autoWeeklyReport}
                onChange={(e) => setAutoWeeklyReport(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white group-hover:text-orange-400 transition">
                  Weekly Progress Reports
                </p>
                <p className="text-xs text-zinc-500">Receive AI-generated weekly summaries every Sunday</p>
              </div>
              {autoWeeklyReport && <Check className="h-4 w-4 text-green-400" />}
            </label>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Automation features are in beta. Your preferences will be synchronized across all devices.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Workout Plan Dialog */}
      <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Your Generated Workout Plan</DialogTitle>
          </DialogHeader>
          {workoutResult && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Duration</p>
                <p className="text-white">{workoutResult.duration} minutes</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Difficulty</p>
                <p className="text-white">{workoutResult.difficulty}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Exercises</p>
                <div className="space-y-2">
                  {workoutResult.exercises.map((ex, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3">
                      <p className="font-medium text-white">{ex.name}</p>
                      <p className="text-xs text-zinc-400">
                        {ex.sets} sets × {ex.reps} reps {ex.duration ? `• ${ex.duration}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {workoutResult.notes && (
                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-2">Notes</p>
                  <p className="text-sm text-zinc-400">{workoutResult.notes}</p>
                </div>
              )}

              <Button
                onClick={handleSaveWorkout}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Save to My Workouts
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Meal Plan Dialog */}
      <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Your Generated Meal Plan</DialogTitle>
          </DialogHeader>
          {mealResult && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Daily Calories</p>
                <p className="text-2xl font-bold text-orange-500">{mealResult.totalCalories}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Meals</p>
                <div className="space-y-2">
                  {mealResult.meals.map((meal, i) => (
                    <div key={i} className="bg-zinc-800 rounded-lg p-3">
                      <p className="font-medium text-white">{meal.name}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {meal.calories} cal • P: {meal.macros.protein}g • C: {meal.macros.carbs}g • F: {meal.macros.fats}g
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {mealResult.notes && (
                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-2">Notes</p>
                  <p className="text-sm text-zinc-400">{mealResult.notes}</p>
                </div>
              )}

              <Button
                onClick={handleSaveMealPlan}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Save Meal Plan
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Insight Dialog */}
      <Dialog open={insightDialogOpen} onOpenChange={setInsightDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Your Progress Insights</DialogTitle>
          </DialogHeader>
          {insightResult && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Summary</p>
                <p className="text-white text-sm">{insightResult.summary}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Your Achievements</p>
                <ul className="space-y-1">
                  {insightResult.achievements.map((achievement, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-semibold text-zinc-300 mb-2">Recommendations</p>
                <ul className="space-y-1">
                  {insightResult.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-orange-500 flex-shrink-0 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-300 mb-1">Next Milestone</p>
                <p className="text-sm text-blue-200">{insightResult.nextMilestone}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
