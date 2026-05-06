"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Music, Users, Brain, Mail, Github, Twitter, Instagram, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const rotatingWords = ["Strength", "Discipline", "Focus", "Clarity", "Consistency"];

  useEffect(() => {
    setMounted(true);
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

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setWaitlistLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.error || "Failed to join waitlist");
        return;
      }

      setWaitlistSuccess(true);
      setEmail("");
      toast.success("Welcome to the waitlist!");
      setTimeout(() => setWaitlistSuccess(false), 3000);
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div className="w-full bg-zinc-950 text-white overflow-hidden">
      {/* Animated stars background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-zinc-950" />
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 1.5 + "px",
              height: Math.random() * 1.5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.7 + 0.3,
              animationDuration: Math.random() * 3 + 2 + "s",
            }}
          />
        ))}
        {/* Glow gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(249,115,22,0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(249,115,22,0.05),transparent_70%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-black text-orange-500">Gymtality</div>
        <div className="flex gap-6">
          <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition">
            Log In
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
        {/* Rotating word */}
        <div className="h-7 mb-6 flex items-center justify-center">
          <span
            className="text-sm font-bold uppercase tracking-[0.25em] text-orange-400 transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {rotatingWords[wordIndex]}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-center max-w-4xl mb-6 animate-fade-in">
          Train Your Body.{" "}
          <span className="text-orange-400">Strengthen Your Mind.</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg text-zinc-400 text-center max-w-2xl mb-12 animate-fade-in-delay">
          Gymtality combines fitness, mindset, music, and community into one platform. Transform
          your body and mind with personalized coaching, live streams, and a global fitness family.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-16 animate-fade-in-delay-2">
          <Link href="/signup" className="group">
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/25 active:scale-95 whitespace-nowrap">
              Join Early Access
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/member/dashboard" className="group">
            <button className="flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 hover:border-orange-500 text-white font-bold rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap">
              Explore Platform
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-8 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>Free to try</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>Live coaches</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={16} className="text-green-500" />
            <span>Premium content</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Why Gymtality?</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Everything you need for a complete fitness transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
                <Zap size={28} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Fitness Training</h3>
              <p className="text-zinc-400 leading-relaxed">
                Access personalized workout plans from certified coaches. Track progress with real-time metrics and adaptive programming designed to challenge you at every level.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
                <Brain size={28} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Mental Wellness</h3>
              <p className="text-zinc-400 leading-relaxed">
                Daily affirmations, meditation sessions, and mindset training. Build mental resilience alongside physical strength with guidance from wellness experts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
                <Music size={28} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Music Integration</h3>
              <p className="text-zinc-400 leading-relaxed">
                Curated playlists from world-class artists. Upload your own music and get featured on workout playlists used by thousands of athletes globally.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-colors">
                <Users size={28} className="text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Community & Challenges</h3>
              <p className="text-zinc-400 leading-relaxed">
                Connect with a global fitness community. Participate in challenges, compete on leaderboards, and celebrate victories together with people who share your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section className="relative z-10 py-24 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left side - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Your Music,{" "}
                <span className="text-orange-400">Powering Workouts</span>
              </h2>
              <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                Upload your music directly to Gymtality. Get featured on workout playlists used by
                thousands of fitness enthusiasts worldwide. Grow your fanbase while members power
                through their workouts with your beats.
              </p>
              <div className="space-y-4">
                {["Earn from artist uploads", "Global reach to fitness enthusiasts", "Real-time listener analytics"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check size={20} className="text-orange-500" />
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <button className="mt-10 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200">
                Become an Artist
              </button>
            </div>

            {/* Right side - Visual */}
            <div className="relative h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-transparent rounded-2xl blur-3xl" />
              <div className="relative h-full bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center">
                <Music size={64} className="text-orange-500 mb-4" />
                <p className="text-zinc-400 text-center">
                  Music upload feature with real-time analytics dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Experience the Platform</h2>
            <p className="text-xl text-zinc-400">
              Available on web and mobile devices
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mock preview 1 */}
            <div className="relative h-96 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
              <div className="relative h-full bg-zinc-800 rounded-lg flex flex-col items-center justify-center">
                <Zap size={48} className="text-orange-500 mb-4" />
                <p className="text-center text-zinc-400">Workout Dashboard</p>
              </div>
            </div>

            {/* Mock preview 2 */}
            <div className="relative h-96 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
              <div className="relative h-full bg-zinc-800 rounded-lg flex flex-col items-center justify-center">
                <Users size={48} className="text-orange-500 mb-4" />
                <p className="text-center text-zinc-400">Live Coaching</p>
              </div>
            </div>

            {/* Mock preview 3 */}
            <div className="relative h-96 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
              <div className="relative h-full bg-zinc-800 rounded-lg flex flex-col items-center justify-center">
                <Music size={48} className="text-orange-500 mb-4" />
                <p className="text-center text-zinc-400">Music Playlists</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="relative z-10 py-24 px-6 border-t border-zinc-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Join{" "}
            <span className="text-orange-400">Thousands</span> on
            <br />
            Our Waitlist
          </h2>
          <p className="text-xl text-zinc-400 mb-12">
            Be among the first to access premium features, exclusive content, and live coaching sessions.
          </p>

          {waitlistSuccess ? (
            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/50 text-green-400">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Check size={24} />
                <span className="font-bold text-lg">Welcome to the waitlist!</span>
              </div>
              <p className="text-sm">Check your email for exclusive updates and early access opportunities.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500 rounded-xl text-white placeholder-zinc-600 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={waitlistLoading}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {waitlistLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Join Now
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-sm text-zinc-500 mt-6">
            No spam, just updates. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-black text-orange-500 mb-4">Gymtality</h3>
              <p className="text-zinc-400 text-sm">
                Transform your body and mind with personalized fitness coaching and community support.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/member/dashboard" className="hover:text-white transition">
                    For Members
                  </Link>
                </li>
                <li>
                  <Link href="/coach/dashboard" className="hover:text-white transition">
                    For Coaches
                  </Link>
                </li>
                <li>
                  <Link href="/admin/dashboard" className="hover:text-white transition">
                    For Admins
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-orange-500 transition"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-orange-500 transition"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-orange-500 transition"
                >
                  <Github size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500">
            <p>&copy; {new Date().getFullYear()} Gymtality. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-zinc-300 transition">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-zinc-300 transition">
                Terms
              </Link>
              <a href="mailto:hello@gymtality.fit" className="hover:text-zinc-300 transition">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fade-in-delay {
          animation: fadeIn 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fadeIn 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
