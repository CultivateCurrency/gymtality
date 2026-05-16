import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the tracing root to this project so Next 15 doesn't walk the entire
  // user profile when sibling lockfiles exist (see ../package-lock.json and
  // ~/package-lock.json which were causing build-worker OOMs).
  outputFileTracingRoot: path.join(__dirname),
  typescript: {
    // tsc --noEmit passes clean; the build worker OOMs on 60+ routes
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
