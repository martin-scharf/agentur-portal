import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
