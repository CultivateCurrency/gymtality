/**
 * Vitest config — frontend component + hook tests.
 *
 * Why Vitest over Jest in a Next.js 15 project:
 *   - Native ESM, native TypeScript — no babel/swc-jest config dance
 *   - Reuses Vite's dep-pre-bundling so first run is ~3x faster
 *   - Same RTL/jest-dom contract as Jest tests, so engineers don't have to
 *     re-learn the assertion vocabulary
 *
 * Scope is intentional: only `src/__tests__/**` and `*.test.ts(x)` next to
 * the component under test. Playwright e2e lives in `tests/` and is run by
 * its own command — we don't blur the two.
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["tests/**", "node_modules/**", ".next/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/components/**", "src/hooks/**"],
      exclude: ["**/*.test.*", "**/index.ts", "src/components/ui/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
