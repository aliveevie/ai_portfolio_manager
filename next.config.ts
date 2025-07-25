import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    INFURA_PROJECT_ID: process.env.INFURA_PROJECT_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;