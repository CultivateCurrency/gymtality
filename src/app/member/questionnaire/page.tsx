"use client";

import { useState } from "react";
import { apiFetch } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

const STEPS = [
  "Personal Info",
  "Body Stats",
  "Activity & Goals",
  "Diet & Medical",
  "Preferences",
];

const GOALS = [
  "Lose Fat",
  "Gain Weight",
  "Build Muscle",
  "Improve Endurance",
  "Increase Flexibility",
  "Reduce Stress",
  "General Fitness",
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const INJURY_OPTIONS = [
  "Lower Back",
  "Knees",
  "Shoulders",
  "Wrists",
  "Neck",
  "Hips",
  "Ankles",
  "None",
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    age: "",
    gender: "",
    dob: "",
    height: "",
    weight: "",
    activityLevel: "",
    goals: [] as string[],
    dietPreference: "",
    medicalConsiderations: "",
    equipmentAccess: "",
    injuryFlags: [] as string[],
    preferredDays: [] as string[],
  });

  const updateField = (field: string, value: string | string[]) => {
    setForm({ ...form, [field]: value });
  };

  const toggleArrayItem = (field: "goals" | "injuryFlags" | "preferredDays", item: string) => {
    const arr = form[field];
    if (item === "None" && field === "injuryFlags") {
      updateField(field, ["None"]);
      return;
    }
    if (arr.includes(item)) {
      updateField(field, arr.filter((i) => i !== item && i !== "None"));
    } else {
      updateField(field, [...arr.filter((i) => i !== "None"), item]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await apiFetch("/api/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          age: parseInt(form.age),
          gender: form.gender,
          dob: form.dob,
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
          activityLevel: form.activityLevel,
          goals: form.goals,
          dietPreference: form.dietPreference,
          medicalConsiderations: form.medicalConsiderations,
          equipmentAccess: form.equipmentAccess,
          injuryFlags: form.injuryFlags.filter((i) => i !== "None"),
          preferredDays: form.preferredDays,
        }),
      });
      router.push("/member/dashboard");
    } catch (error) {
      console.error("Questionnaire error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Fitness Profile</h1>
      <p className="text-zinc-400 mb-8">
        Help us personalize your experience. Step {step + 1} of {STEPS.length}.
      </p>

      {/* Progress Bar */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-orange-500" : "bg-zinc-800"
            }`}
          />
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">{STEPS[step]}</CardTitle>
          <CardDescription className="text-zinc-400">
            {step === 0 && "Tell us about yourself"}
            {step === 1 && "Your body measurements"}
            {step === 2 && "Your activity level and fitness goals"}
            {step === 3 && "Diet preference and medical info"}
            {step === 4 && "Equipment and schedule preferences"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-300">Age</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="25"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Gender</Label>
                <div className="flex gap-3">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => updateField("gender", g)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
                        form.gender === g
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </>
          )}

          {/* Step 1: Body Stats */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-300">Height (cm)</Label>
                <Input
                  type="number"
                  value={form.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  placeholder="175"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Weight (kg)</Label>
                <Input
                  type="number"
                  value={form.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="75"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </>
          )}

          {/* Step 2: Activity & Goals */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-300">Activity Level</Label>
                <div className="flex gap-3">
                  {["LOW", "MODERATE", "HIGH"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateField("activityLevel", level)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
                        form.activityLevel === level
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {level.charAt(0) + level.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Goals (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleArrayItem("goals", goal)}
                      className={`py-2.5 px-4 rounded-lg border text-sm font-medium text-left transition ${
                        form.goals.includes(goal)
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {form.goals.includes(goal) && (
                        <CheckCircle className="inline w-4 h-4 mr-1" />
                      )}
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: Diet & Medical */}
          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-300">Diet Preference</Label>
                <div className="flex gap-3">
                  {["VEGETARIAN", "NON_VEGETARIAN"].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => updateField("dietPreference", diet)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
                        form.dietPreference === diet
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {diet === "VEGETARIAN" ? "Vegetarian" : "Non-Vegetarian"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Medical Considerations (optional)
                </Label>
                <Textarea
                  value={form.medicalConsiderations}
                  onChange={(e) =>
                    updateField("medicalConsiderations", e.target.value)
                  }
                  placeholder="Any medical conditions, allergies, or medications..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Injury Flags</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INJURY_OPTIONS.map((injury) => (
                    <button
                      key={injury}
                      type="button"
                      onClick={() => toggleArrayItem("injuryFlags", injury)}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium text-left transition ${
                        form.injuryFlags.includes(injury)
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {injury}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 4: Preferences */}
          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label className="text-zinc-300">Equipment Access</Label>
                <div className="flex gap-3">
                  {["HOME", "GYM", "BOTH"].map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => updateField("equipmentAccess", eq)}
                      className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
                        form.equipmentAccess === eq
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {eq.charAt(0) + eq.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Preferred Workout Days</Label>
                <div className="flex gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleArrayItem("preferredDays", day)}
                      className={`w-12 h-12 rounded-lg border text-sm font-bold transition ${
                        form.preferredDays.includes(day)
                          ? "border-orange-500 bg-orange-500/10 text-orange-500"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Complete Profile"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
