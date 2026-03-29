"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronRight, ChevronLeft, Dumbbell, Users, Calendar, Music, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_STEPS = [
  {
    title: "Welcome to Gymtality!",
    description: "Let's take a quick tour of the platform. You can skip this at any time.",
    icon: Trophy,
    color: "text-orange-500",
    page: "/member/dashboard",
  },
  {
    title: "Browse Workouts",
    description: "Explore workout plans by category, search with filters, and log your sessions to track progress.",
    icon: Dumbbell,
    color: "text-blue-400",
    page: "/member/workouts",
  },
  {
    title: "Join the Community",
    description: "Create posts, join groups, comment, like, and connect with fellow members.",
    icon: Users,
    color: "text-green-400",
    page: "/member/community",
  },
  {
    title: "Attend Events",
    description: "Browse upcoming classes, workshops, and gym events. RSVP and get a QR code for check-in.",
    icon: Calendar,
    color: "text-purple-400",
    page: "/member/events",
  },
  {
    title: "Listen to Music",
    description: "Browse the music library, create playlists, and play your favorite workout tracks.",
    icon: Music,
    color: "text-pink-400",
    page: "/member/music",
  },
  {
    title: "Set Your Goals",
    description: "Define fitness goals — weight, strength, cardio, or custom — and track your progress over time.",
    icon: Target,
    color: "text-emerald-400",
    page: "/member/goals",
  },
  {
    title: "You're All Set!",
    description: "Explore the platform at your own pace. Check your Activity page for stats and visit Settings to customize your experience.",
    icon: Trophy,
    color: "text-amber-400",
    page: "/member/dashboard",
  },
];

const TOUR_KEY = "gymtality-tour-completed";

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only show on member pages and if not completed
    if (!pathname.startsWith("/member")) return;
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      setVisible(true);
    }
  }, [pathname]);

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const isLast = step === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleDismiss();
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    router.push(TOUR_STEPS[nextStep].page);
  };

  const handlePrev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      setStep(prevStep);
      router.push(TOUR_STEPS[prevStep].page);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(TOUR_KEY, "true");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Icon className={`h-5 w-5 ${current.color}`} />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Step {step + 1} of {TOUR_STEPS.length}</p>
              <h3 className="font-semibold text-white">{current.title}</h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-500 hover:text-zinc-300 transition p-1"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-sm text-zinc-400 mb-4">{current.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleDismiss}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-3 w-3 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleNext}
            >
              {isLast ? "Get Started" : "Next"}
              {!isLast && <ChevronRight className="h-3 w-3 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
