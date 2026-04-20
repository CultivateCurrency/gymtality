"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingMusicPlayer } from "@/components/landing/music-player";

const rotatingWords = ["Strength", "Discipline", "Focus", "Clarity", "Consistency"];

export default function WelcomePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [todayDate, setTodayDate] = useState("");

  useEffect(() => {
    setMounted(true);
    // Set today's date in YYYY-MM-DD format for music player
    const today = new Date();
    setTodayDate(today.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % rotatingWords.length);
        setVisible(true);
      }, 350);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-zinc-950">
      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(249,115,22,0.12),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(249,115,22,0.05),transparent_70%)]" />

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

      {/* Main content */}
      <main
        className={`relative z-10 flex flex-col items-center text-center px-6 w-full max-w-sm mx-auto transition-opacity duration-700 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Rotating word */}
        <div className="h-7 mb-5 flex items-center justify-center">
          <span
            className="text-[13px] font-bold uppercase tracking-[0.25em] text-orange-400 transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {rotatingWords[wordIndex]}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.6rem] md:text-5xl font-black tracking-tight leading-[1.08] text-white mb-5">
          Train Your Body.<br />
          <span className="text-orange-400">Master Your Mind.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-[14px] text-zinc-400 leading-relaxed mb-10 max-w-[300px]">
          Your complete fitness ecosystem — workouts, live coaching, community, and nutrition — built for a holistic transformation.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col w-full gap-3 mb-9">
          <Link href="/signup" className="w-full">
            <button className="group w-full flex items-center justify-center gap-2 py-[14px] px-8 bg-orange-500 hover:bg-orange-400 text-white font-bold text-[14px] rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 active:scale-[0.98]">
              Get Started
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Login link */}
        <p className="text-[12px] text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
          >
            Log In
          </Link>
        </p>
      </main>


      {/* Footer */}
      <footer className="relative z-10 absolute bottom-0 left-0 right-0 pb-7 flex items-center justify-center gap-5 text-[11px] text-zinc-700">
        <Link href="/terms" className="hover:text-zinc-500 transition-colors">
          Terms
        </Link>
        <span>·</span>
        <Link href="/privacy" className="hover:text-zinc-500 transition-colors">
          Privacy
        </Link>
        <span>·</span>
        <span>&copy; {new Date().getFullYear()} Gymtality</span>
      </footer>

      {/* Landing Music Player */}
      <div className="relative z-5 w-full">
        {todayDate && <LandingMusicPlayer date={todayDate} />}
      </div>
    </div>
  );
}
