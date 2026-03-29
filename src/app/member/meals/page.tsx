"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UtensilsCrossed, Plus, Trash2, Loader2, Flame, Beef, Wheat, Droplets } from "lucide-react";
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

  const { data: plans, loading, refetch } = useApi<MealPlan[]>("/api/meals");

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
      await apiFetch("/api/meals", {
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
      await apiFetch(`/api/meals/${id}`, { method: "DELETE" });
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Meal Plans</h1>
          <p className="text-zinc-400 mt-1">Plan your nutrition and track macros.</p>
        </div>
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
    </div>
  );
}
