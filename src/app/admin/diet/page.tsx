"use client";

import { useState } from "react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, UtensilsCrossed, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface DietTemplateItem {
  id?: string;
  name: string;
  mealType: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  notes: string | null;
  dayOfWeek: string | null;
}

interface DietTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  active: boolean;
  items: DietTemplateItem[];
  createdAt: string;
}

const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const DIET_CATEGORIES = [
  "weight_loss",
  "muscle_gain",
  "maintenance",
  "vegetarian",
  "vegan",
  "keto",
  "high_protein",
];

const emptyItem = (): DietTemplateItem => ({
  name: "",
  mealType: "BREAKFAST",
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  notes: null,
  dayOfWeek: "MON",
});

export default function AdminDietPage() {
  const { data, loading, refetch } = useApi<DietTemplate[]>("/api/admin/diet-templates");
  const templates = data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DietTemplate | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [items, setItems] = useState<DietTemplateItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setCategory("");
    setItems([emptyItem()]);
    setModalOpen(true);
  }

  function openEdit(t: DietTemplate) {
    setEditing(t);
    setName(t.name);
    setDescription(t.description ?? "");
    setCategory(t.category ?? "");
    setItems(t.items.length > 0 ? t.items : [emptyItem()]);
    setModalOpen(true);
  }

  function updateItem(i: number, field: keyof DietTemplateItem, value: any) {
    const updated = [...items];
    (updated[i] as any)[field] = value === "" ? null : value;
    setItems(updated);
  }

  async function handleSave() {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        category: category || null,
        items: items
          .filter((it) => it.name.trim())
          .map((it) => ({
            name: it.name,
            mealType: it.mealType,
            calories: it.calories ? Number(it.calories) : null,
            protein: it.protein ? Number(it.protein) : null,
            carbs: it.carbs ? Number(it.carbs) : null,
            fat: it.fat ? Number(it.fat) : null,
            notes: it.notes || null,
            dayOfWeek: it.dayOfWeek || null,
          })),
      };
      if (editing) {
        // Delete and recreate for simplicity (no patch-items endpoint)
        await apiFetch(`/api/admin/diet-templates/${editing.id}`, { method: "DELETE" });
        await apiFetch("/api/admin/diet-templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Diet template updated");
      } else {
        await apiFetch("/api/admin/diet-templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Diet template created");
      }
      setModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/admin/diet-templates/${id}`, { method: "DELETE" });
      toast.success("Diet template deleted");
      setDeleteId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete template");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Diet Templates</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create meal plan templates that members can follow for their nutrition goals.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-400 text-white">
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No diet templates yet.</p>
            <Button onClick={openCreate} className="mt-4 bg-orange-500 hover:bg-orange-400 text-white">
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <Card key={t.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-white text-base">{t.name}</CardTitle>
                    {t.description && (
                      <p className="text-zinc-400 text-sm mt-1">{t.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {t.category && (
                        <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs capitalize">
                          {t.category.replace(/_/g, " ")}
                        </Badge>
                      )}
                      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                        {t.items.length} meals
                      </Badge>
                      {!t.active && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition text-xs px-2"
                    >
                      {expandedId === t.id ? "Hide" : "View"}
                    </button>
                    <button
                      onClick={() => openEdit(t)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteId(t.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              {expandedId === t.id && t.items.length > 0 && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {t.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-t border-zinc-800 text-sm">
                        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs shrink-0">
                          {item.dayOfWeek ?? "—"} · {item.mealType}
                        </Badge>
                        <span className="text-white flex-1">{item.name}</span>
                        {item.calories && (
                          <span className="text-zinc-400 text-xs">{item.calories} kcal</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Diet Template" : "New Diet Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-300 text-sm">Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 7-Day Muscle Gain Plan"
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-sm">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {DIET_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-white capitalize">
                        {c.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this plan"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Meals */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-zinc-300 text-sm">Meals</Label>
                <button
                  onClick={() => setItems([...items, emptyItem()])}
                  className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Meal
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="bg-zinc-800 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2 items-center">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                        placeholder="Meal name (e.g. Oatmeal with berries)"
                        className="flex-1 bg-zinc-700 border-zinc-600 text-white text-sm"
                      />
                      <button
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                        className="text-zinc-500 hover:text-red-400 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Select value={item.mealType} onValueChange={(v) => updateItem(i, "mealType", v)}>
                        <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {MEAL_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={item.dayOfWeek ?? "MON"} onValueChange={(v) => updateItem(i, "dayOfWeek", v)}>
                        <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white text-sm h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d} className="text-white">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                        <Input
                          key={field}
                          type="number"
                          value={item[field] ?? ""}
                          onChange={(e) => updateItem(i, field, e.target.value)}
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                          className="bg-zinc-700 border-zinc-600 text-white text-xs h-8"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="text-zinc-400">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-400 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Diet Template</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">
            This will permanently remove this diet template and all its meals.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="text-zinc-400">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
