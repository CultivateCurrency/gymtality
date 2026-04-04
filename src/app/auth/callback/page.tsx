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

    const user = {
      id: params.get("userId") ?? "",
      role: params.get("role") ?? "MEMBER",
      fullName: params.get("fullName") ?? "",
      email: params.get("email") ?? "",
      username: params.get("username") ?? "",
      profilePhoto: params.get("profilePhoto") ?? null,
      tenantId: "",
      emailVerified: true,
    };

    login(user as any, accessToken, refreshToken);

    if (["ADMIN", "OWNER", "SUPER_ADMIN"].includes(user.role)) {
      router.replace("/admin/dashboard");
    } else if (user.role === "COACH") {
      router.replace("/coach/dashboard");
    } else {
      router.replace("/member/dashboard");
    }
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
