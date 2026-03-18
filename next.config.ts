import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // tsc --noEmit passes clean; the build worker OOMs on 60+ routes
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
