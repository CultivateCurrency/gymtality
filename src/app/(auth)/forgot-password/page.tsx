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
import { Loader2, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("OTP sent to your email");
        setStep("otp");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage("Password reset successfully!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur">
      <CardHeader>
        <Link
          href="/login"
          className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm mb-2 w-fit"
        >
          <ArrowLeft size={16} /> Back to login
        </Link>
        <CardTitle className="text-white text-2xl">
          {step === "email" && "Forgot Password"}
          {step === "otp" && "Enter OTP"}
          {step === "reset" && "Reset Password"}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {step === "email" && "Enter your email to receive a reset code"}
          {step === "otp" && `Enter the 6-digit code sent to ${email}`}
          {step === "reset" && "Create your new password"}
        </CardDescription>
      </CardHeader>

      {step === "email" && (
        <form onSubmit={handleRequestOTP}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Registered Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="john@example.com"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
            </Button>
          </CardFooter>
        </form>
      )}

      {step === "otp" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (otp.length === 6) setStep("reset");
            else setError("Enter the full 6-digit OTP");
          }}
        >
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-zinc-300">
                OTP Code
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="123456"
                required
                className="bg-zinc-800 border-zinc-700 text-white text-center text-2xl tracking-widest placeholder:text-zinc-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              Continue
            </Button>
          </CardFooter>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleVerifyAndReset}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {message}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-zinc-300">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword" className="text-zinc-300">
                Confirm New Password
              </Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Confirm your new password"
                required
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
