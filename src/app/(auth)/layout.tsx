import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />

      {/* Logo — top-left */}
      <div className="fixed top-0 left-0 p-5 z-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <Dumbbell size={16} className="text-white" />
          </div>
          <span className="text-sm font-black tracking-tight text-white">GYMTALITY</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {children}

        <p className="mt-8 text-[11px] text-zinc-700 text-center">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="hover:text-zinc-500 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="hover:text-zinc-500 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
