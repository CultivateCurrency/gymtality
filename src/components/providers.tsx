"use client";

import { ThemeProvider } from "next-themes";
import { AuthInitializer } from "./auth-initializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthInitializer />
      {children}
    </ThemeProvider>
  );
}
