import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none" />

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
