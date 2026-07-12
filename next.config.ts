import type { NextConfig } from "next";
import fs from "fs";
import path from "path";



const nextConfig: NextConfig = {
  // Explicitly opt-in to Turbopack (Next.js 16 default bundler).
  // Silences the "webpack config with no turbopack config" warning.
  turbopack: {},
};

export default nextConfig;
