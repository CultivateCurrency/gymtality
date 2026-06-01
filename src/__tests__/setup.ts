/**
 * Global test setup — runs before every test file.
 *
 *   - Imports @testing-library/jest-dom matchers so `.toBeInTheDocument()`,
 *     `.toHaveAttribute()`, etc. work without manual imports per-file.
 *   - Stubs `Intl.DateTimeFormat().resolvedOptions().timeZone` to a fixed
 *     value so timezone-sensitive components render deterministically
 *     regardless of which machine runs the test (CI runner is UTC; my
 *     laptop isn't; we want tests to agree).
 */
import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Deterministic timezone for any test that doesn't override it.
const fakeResolvedOptions = () => ({ timeZone: "UTC" }) as Intl.ResolvedDateTimeFormatOptions;
vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockImplementation(fakeResolvedOptions);
