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
import { Plus, Pencil, Trash2, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GoalTemplate {
  id: string;
  type: string;
  title: string;
  description: string | null;
  target: number;
  unit: string;
  active: boolean;
  createdAt: string;
}

const GOAL_TYPES = ["weight", "strength", "cardio", "custom"];

const defaultForm = {
  title: "",
  type: "custom",
  description: "",
  target: "",
  unit: "",
  active: true,
};

export default function AdminGoalsPage() {
  const { data, loading, refetch } = useApi<GoalTemplate[]>("/api/admin/goal-templates");
  const templates = data ?? [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GoalTemplate | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEdit(t: GoalTemplate) {
    setEditing(t);
    setForm({
      title: t.title,
      type: t.type,
      description: t.description ?? "",
      target: t.target.toString(),
      unit: t.unit,
      active: t.active,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim() || null,
        target: parseFloat(form.target) || 0,
        unit: form.unit.trim(),
        active: form.active,
      };
      if (editing) {
        await apiFetch(`/api/admin/goal-templates/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Template updated");
      } else {
        await apiFetch("/api/admin/goal-templates", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Template created");
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
      await apiFetch(`/api/admin/goal-templates/${id}`, { method: "DELETE" });
      toast.success("Template deleted");
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
          <h1 className="text-2xl font-bold text-white">Goal Templates</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Create goal templates that members can adopt and track.
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
            <Target className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No goal templates yet.</p>
            <Button onClick={openCreate} className="mt-4 bg-orange-500 hover:bg-orange-400 text-white">
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-white text-base">{t.title}</CardTitle>
                  <div className="flex gap-1 shrink-0">
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
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs capitalize">
                    {t.type}
                  </Badge>
                  {!t.active && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {t.description && (
                  <p className="text-zinc-400 text-sm">{t.description}</p>
                )}
                <p className="text-sm text-zinc-300">
                  Target: <span className="font-semibold text-orange-400">{t.target} {t.unit}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Goal Template" : "New Goal Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-zinc-300 text-sm">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Lose 10 lbs in 3 months"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {GOAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-white capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-zinc-300 text-sm">Target Value</Label>
                <Input
                  type="number"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                  placeholder="e.g. 10"
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-sm">Unit</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="e.g. lbs, km, reps"
                  className="mt-1 bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                className="mt-1 bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="accent-orange-500"
              />
              <Label htmlFor="active" className="text-zinc-300 text-sm cursor-pointer">
                Active (visible to members)
              </Label>
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
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">This will permanently remove this goal template.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="text-zinc-400">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
