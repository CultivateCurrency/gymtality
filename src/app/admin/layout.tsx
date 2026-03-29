import { Sidebar } from "@/components/shared/sidebar";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar variant="admin" />
      <main id="main-content" className="ml-64 min-h-screen">
        <div className="p-6">
          <Breadcrumbs />
          {children}
        </div>
      </main>
    </div>
  );
}
