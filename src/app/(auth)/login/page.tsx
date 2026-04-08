"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Reads ?error= param from the URL after Google OAuth redirect and shows a toast.
// Must be inside Suspense because useSearchParams() suspends during SSR.
function OAuthErrorHandler() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "google_signin_failed" || err === "google_failed") {
      toast.error("Google sign-in failed. Please try again or use email.");
    } else if (err === "google_signin_cancelled") {
      toast.info("Google sign-in was cancelled.");
    }
  }, [searchParams]);
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid email or password. Please try again.");
        return;
      }

      const { user, accessToken, refreshToken } = data.data;
      login(user, accessToken, refreshToken);

      if (["ADMIN", "OWNER", "SUPER_ADMIN"].includes(user.role)) {
        router.push("/admin/dashboard");
      } else if (user.role === "COACH") {
        router.push("/coach/dashboard");
      } else {
        router.push("/member/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Suspense>
        <OAuthErrorHandler />
      </Suspense>

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-sm text-zinc-500 mt-1">Sign in to your account</p>
      </div>

      {/* Social login */}
      <div className="flex gap-3 mb-6">
        <a
          href={`${API_URL}/api/auth/google`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[13px] font-medium text-zinc-300 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </a>
        <a
          href={`${API_URL}/api/auth/apple`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-[13px] font-medium text-zinc-300 hover:text-white transition-all"
        >
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Apple
        </a>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-[11px] text-zinc-600 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/50 rounded-xl text-[14px] text-white placeholder-zinc-600 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">Password</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-11 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500/50 rounded-xl text-[14px] text-white placeholder-zinc-600 outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-[12px] text-orange-400 hover:text-orange-300 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold text-[14px] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {isLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : "Sign In"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-[13px] text-zinc-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-semibold transition-colors">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
