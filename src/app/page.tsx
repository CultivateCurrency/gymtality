import Link from "next/link";
import {
  Dumbbell,
  Users,
  Calendar,
  Radio,
  Music,
  ShoppingBag,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Dumbbell, title: "Workouts", desc: "Home & gym plans with video guides" },
  { icon: Users, title: "Community", desc: "Connect, share, and train together" },
  { icon: Calendar, title: "Events", desc: "Classes, workshops, and appointments" },
  { icon: Radio, title: "Live Streaming", desc: "Join live classes from anywhere" },
  { icon: Music, title: "Music", desc: "Workout playlists and albums" },
  { icon: ShoppingBag, title: "Shop", desc: "Merchandise and supplements" },
  { icon: Trophy, title: "Challenges", desc: "Compete on leaderboards" },
  { icon: Users, title: "Coaching", desc: "1:1 sessions with certified trainers" },
];

export default function SplashPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-zinc-950" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-40">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
              <span className="text-orange-500">GYMTALITY</span>
            </h1>
            <p className="text-xl md:text-2xl text-zinc-300 mb-2 font-light">
              Your Fitness Mentality. 24/7.
            </p>
            <p className="text-lg text-zinc-400 mb-8 max-w-lg">
              Your complete fitness ecosystem — workouts, community, live
              classes, coaching, music, and more. Everything you need to
              transform your body and mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 h-14"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white font-semibold text-lg px-8 h-14"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to{" "}
          <span className="text-orange-500">Compete</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 hover:border-orange-500/50 transition-colors group"
            >
              <feature.icon className="w-8 h-8 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for Coaches */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-orange-500/10 to-zinc-900 border border-orange-500/20 rounded-2xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Are You a Coach or Trainer?
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto mb-8">
            Upload your programs, manage clients, host live classes, and grow
            your business — all from one platform.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 h-14"
            >
              Join as a Coach
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} Gymtality. All rights
            reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
