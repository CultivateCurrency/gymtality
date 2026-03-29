"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SignUpPage() {
  const router = useRouter();
  const { setPendingEmail } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [role, setRole] = useState<"MEMBER" | "COACH">("MEMBER");

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("You must agree to the Privacy Policy and Terms of Service");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        return;
      }

      setPendingEmail(form.email);
      router.push("/verify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Create Account</CardTitle>
        <CardDescription className="text-zinc-400">
          Join Gymtality and start your journey
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Role Toggle */}
          <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                role === "MEMBER"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setRole("MEMBER")}
            >
              Member
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                role === "COACH"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              onClick={() => setRole("COACH")}
            >
              Coach / Trainer
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-zinc-300">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={form.fullName}
              onChange={handleChange}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-zinc-300">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-zinc-300">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Profile Photo — placeholder for S3 upload */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Profile Photo (optional)</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 text-xs">
                Photo
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Upload
              </Button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 accent-orange-500"
            />
            <span className="text-sm text-zinc-400">
              I agree to the{" "}
              <Link href="/privacy" className="text-orange-500 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-orange-500 hover:underline">
                Terms of Service
              </Link>
            </span>
          </label>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          <p className="text-sm text-zinc-400 text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
