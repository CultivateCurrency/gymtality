export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-orange-500">FORGE</span>{" "}
            <span className="text-white">FITNESS</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Forged Daily. 24/7.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
