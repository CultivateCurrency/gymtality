"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Loader2 } from "lucide-react";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = params.get("accessToken");
      const refreshToken = params.get("refreshToken");
      const error = params.get("error");

      if (error || !accessToken || !refreshToken) {
        const msg = error === "google_cancelled"
          ? "google_signin_cancelled"
          : "google_signin_failed";
        router.replace(`/login?error=${msg}`);
        return;
      }

      const role = params.get("role") ?? "MEMBER";
      const user = {
        id: params.get("userId") ?? "",
        role,
        fullName: params.get("fullName") ?? "",
        email: params.get("email") ?? "",
        username: params.get("username") ?? "",
        profilePhoto: params.get("profilePhoto") ?? null,
        tenantId: params.get("tenantId") ?? "",
      };

      try {
        // POST tokens to Next.js route to set httpOnly cookies
        const res = await fetch("/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            accessToken,
            refreshToken,
            user,
          }),
        });

        if (!res.ok) {
          throw new Error("OAuth callback failed");
        }

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "OAuth callback failed");
        }

        // Store user in Zustand; tokens are in httpOnly cookies (never in JS)
        login(user);

        // Clear sensitive URL params immediately
        const next = params.get("next");
        if (next && next.startsWith("/") && next !== "/") {
          router.replace(next);
        } else if (["ADMIN", "OWNER", "SUPER_ADMIN"].includes(role)) {
          router.replace("/admin/dashboard");
        } else if (role === "COACH") {
          router.replace("/coach/dashboard");
        } else {
          router.replace("/member/dashboard");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        router.replace("/login?error=google_signin_failed");
      }
    };

    handleCallback();
  }, [params, router, login]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      <p className="text-zinc-400 text-sm">Signing you in...</p>
      <Suspense>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
