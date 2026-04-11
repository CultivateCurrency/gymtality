import Link from "next/link";
import { Home } from "lucide-react";
import { Sidebar } from "@/components/shared/sidebar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Home button — top left corner */}
      <Link
        href="/coach/dashboard"
        className="fixed top-4 left-4 z-40 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
        title="Go to dashboard"
      >
        <Home className="h-6 w-6 text-orange-500" />
      </Link>

      <Sidebar variant="coach" />
      <main id="main-content" className="ml-64 min-h-screen">
        <div className="p-6">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
