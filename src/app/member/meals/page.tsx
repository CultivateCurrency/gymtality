"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UtensilsCrossed, Plus, Trash2, Loader2, Flame, Beef, Wheat, Droplets, Sparkles } from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { toast } from "sonner";

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

interface Meal {
  id: string;
  name: string;
  mealType: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  dayOfWeek: string | null;
}

interface MealPlan {
  id: string;
  name: string;
  description: string | null;
  meals: Meal[];
  createdAt: string;
}

export default function MealsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDesc, setPlanDesc] = useState("");
  const [meals, setMeals] = useState<Partial<Meal>[]>([{ name: "", mealType: "BREAKFAST", dayOfWeek: "MON" }]);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [generatedMealPlan, setGeneratedMealPlan] = useState<any>(null);
  const [savingPlan, setSavingPlan] = useState(false);

  const { data: plans, loading, refetch } = useApi<MealPlan[]>("/api/workouts/meals");
  const { data: dietTemplates } = useApi<any[]>("/api/admin/diet-templates");
  const activeTemplates = (dietTemplates ?? []).filter((t) => t.active !== false);

  const handleAdoptTemplate = async (tpl: any) => {
    try {
      await apiFetch("/api/workouts/meals", {
        method: "POST",
        body: JSON.stringify({
          name: tpl.name,
          description: tpl.description,
          meals: (tpl.items ?? []).map((item: any) => ({
            name: item.name,
            mealType: item.mealType,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            notes: item.notes,
            dayOfWeek: item.dayOfWeek,
          })),
        }),
      });
      toast.success(`"${tpl.name}" added to your meal plans`);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to adopt template");
    }
  };

  const addMeal = () => {
    setMeals([...meals, { name: "", mealType: "BREAKFAST", dayOfWeek: "MON" }]);
  };

  const updateMeal = (index: number, field: string, value: any) => {
    const updated = [...meals];
    (updated[index] as any)[field] = value;
    setMeals(updated);
  };

  const removeMeal = (index: number) => {
    setMeals(meals.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!planName.trim()) return;
    setCreating(true);
    try {
      await apiFetch("/api/workouts/meals", {
        method: "POST",
        body: JSON.stringify({
          name: planName,
          description: planDesc || null,
          meals: meals.filter((m) => m.name?.trim()).map((m) => ({
            ...m,
            calories: m.calories ? parseInt(String(m.calories)) : null,
            protein: m.protein ? parseFloat(String(m.protein)) : null,
            carbs: m.carbs ? parseFloat(String(m.carbs)) : null,
            fat: m.fat ? parseFloat(String(m.fat)) : null,
          })),
        }),
      });
      setPlanName("");
      setPlanDesc("");
      setMeals([{ name: "", mealType: "BREAKFAST", dayOfWeek: "MON" }]);
      setDialogOpen(false);
      refetch();
      toast.success("Meal plan created!");
    } catch {
      toast.error("Failed to create meal plan");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await apiFetch(`/api/workouts/meals/${id}`, { method: "DELETE" });
      refetch();
      toast.success("Meal plan deleted");
    } catch {
      toast.error("Failed to delete");
    }
    setDeleting(null);
  };

  // Calculate daily totals
  const getDayTotals = (planMeals: Meal[], day: string) => {
    const dayMeals = planMeals.filter((m) => m.dayOfWeek === day);
    return {
      calories: dayMeals.reduce((s, m) => s + (m.calories || 0), 0),
      protein: dayMeals.reduce((s, m) => s + (m.protein || 0), 0),
      carbs: dayMeals.reduce((s, m) => s + (m.carbs || 0), 0),
      fat: dayMeals.reduce((s, m) => s + (m.fat || 0), 0),
    };
  };

  const handleGenerateAIMealPlan = async () => {
    setGeneratingAI(true);
    try {
      const response = await apiFetch("/api/ai/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysPerWeek: 7, dietType: "balanced" }),
      });
      if (response?.success) {
        setGeneratedMealPlan(response.data);
        toast.success("AI meal plan generated!");
      } else {
        toast.error(response?.error || "Failed to generate meal plan");
      }
    } catch (err) {
      toast.error("Error generating meal plan");
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveAIMealPlan = async () => {
    if (!generatedMealPlan) return;
    setSavingPlan(true);
    try {
      const response = await apiFetch("/api/ai/meal-plan/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedMealPlan),
      });
      if (response?.success) {
        toast.success("Meal plan saved!");
        setAIDialogOpen(false);
        setGeneratedMealPlan(null);
        refetch();
      } else {
        toast.error(response?.error || "Failed to save meal plan");
      }
    } catch (err) {
      toast.error("Error saving meal plan");
      console.error(err);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meal Plans</h1>
          <p className="text-zinc-400 mt-1">Plan your nutrition and track macros.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
            <DialogTrigger>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                <Sparkles className="h-4 w-4" />
                AI Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Generate Your Meal Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {!generatedMealPlan ? (
                  <Button
                    onClick={handleGenerateAIMealPlan}
                    disabled={generatingAI}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {generatingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Meal Plan"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <h3 className="text-white font-semibold mb-2">{generatedMealPlan.name}</h3>
                      <p className="text-zinc-400 text-sm">{generatedMealPlan.description}</p>
                    </div>
                    <Button
                      onClick={handleSaveAIMealPlan}
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
                      onClick={() => setGeneratedMealPlan(null)}
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Create Meal Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Plan name (e.g. Cutting Week)" value={planName} onChange={(e) => setPlanName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-white" />
              <Textarea placeholder="Description (optional)" value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} rows={2} className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500" />

              <div className="space-y-3">
                <p className="text-sm font-medium text-zinc-300">Meals</p>
                {meals.map((meal, i) => (
                  <div key={i} className="p-3 bg-zinc-800 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <Input placeholder="Meal name" value={meal.name || ""} onChange={(e) => updateMeal(i, "name", e.target.value)} className="bg-zinc-700 border-zinc-600 text-white text-sm" />
                      <select value={meal.mealType} onChange={(e) => updateMeal(i, "mealType", e.target.value)} className="bg-zinc-700 border border-zinc-600 rounded-md px-2 text-sm text-white">
                        {MEAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <select value={meal.dayOfWeek || "MON"} onChange={(e) => updateMeal(i, "dayOfWeek", e.target.value)} className="bg-zinc-700 border border-zinc-600 rounded-md px-2 text-sm text-white">
                        {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 shrink-0" onClick={() => removeMeal(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <Input type="number" placeholder="Cals" value={meal.calories || ""} onChange={(e) => updateMeal(i, "calories", e.target.value)} className="bg-zinc-700 border-zinc-600 text-white text-sm" />
                      <Input type="number" placeholder="Protein (g)" value={meal.protein || ""} onChange={(e) => updateMeal(i, "protein", e.target.value)} className="bg-zinc-700 border-zinc-600 text-white text-sm" />
                      <Input type="number" placeholder="Carbs (g)" value={meal.carbs || ""} onChange={(e) => updateMeal(i, "carbs", e.target.value)} className="bg-zinc-700 border-zinc-600 text-white text-sm" />
                      <Input type="number" placeholder="Fat (g)" value={meal.fat || ""} onChange={(e) => updateMeal(i, "fat", e.target.value)} className="bg-zinc-700 border-zinc-600 text-white text-sm" />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300" onClick={addMeal}>
                  <Plus className="h-3 w-3 mr-1" /> Add Meal
                </Button>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={creating || !planName.trim()} onClick={handleCreate}>
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-orange-500 animate-spin" /></div>
      ) : (plans && plans.length > 0) ? (
        plans.map((plan) => (
          <Card key={plan.id} className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                    {plan.name}
                  </CardTitle>
                  {plan.description && <CardDescription className="text-zinc-400 mt-1">{plan.description}</CardDescription>}
                </div>
                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" disabled={deleting === plan.id} onClick={() => handleDelete(plan.id)}>
                  {deleting === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS.filter((d) => plan.meals.some((m) => m.dayOfWeek === d)).map((day) => {
                  const totals = getDayTotals(plan.meals, day);
                  return (
                    <div key={day} className="p-3 bg-zinc-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-white">{day}</p>
                        <div className="flex gap-3 text-xs">
                          <span className="text-orange-400 flex items-center gap-1"><Flame className="h-3 w-3" />{totals.calories} cal</span>
                          <span className="text-blue-400 flex items-center gap-1"><Beef className="h-3 w-3" />{totals.protein}g</span>
                          <span className="text-green-400 flex items-center gap-1"><Wheat className="h-3 w-3" />{totals.carbs}g</span>
                          <span className="text-yellow-400 flex items-center gap-1"><Droplets className="h-3 w-3" />{totals.fat}g</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {plan.meals.filter((m) => m.dayOfWeek === day).map((meal) => (
                          <div key={meal.id} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-zinc-300">{meal.name}</span>
                              <span className="text-zinc-600 text-xs ml-2">{meal.mealType}</span>
                            </div>
                            <span className="text-zinc-500 text-xs">{meal.calories || 0} cal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {plan.meals.length === 0 && <p className="text-zinc-500 text-sm text-center py-4">No meals added to this plan yet.</p>}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="bg-zinc-900 border-zinc-800 border-dashed">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-3 py-8">
              <UtensilsCrossed className="h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">No meal plans yet. Create your first one!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Diet Templates */}
      {activeTemplates.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div>
            <h2 className="text-lg font-semibold text-white">Recommended Diet Plans</h2>
            <p className="text-zinc-400 text-sm">Tap a plan to add it to your meal plans instantly.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeTemplates.map((tpl) => (
              <Card
                key={tpl.id}
                className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer group"
                onClick={() => handleAdoptTemplate(tpl)}
              >
                <CardContent className="pt-4 pb-4 flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-zinc-800 group-hover:bg-orange-500/10 transition">
                    <UtensilsCrossed className="h-5 w-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{tpl.name}</p>
                    {tpl.description && (
                      <p className="text-zinc-400 text-xs truncate">{tpl.description}</p>
                    )}
                    {tpl.category && (
                      <p className="text-zinc-500 text-xs mt-0.5 capitalize">
                        {tpl.category.replace(/_/g, " ")} · {(tpl.items ?? []).length} meals
                      </p>
                    )}
                  </div>
                  <Plus className="h-4 w-4 text-zinc-500 group-hover:text-orange-400 transition shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
