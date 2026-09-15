import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Keep tracing scoped to /frontend even when a root lockfile exists for husky.
  outputFileTracingRoot: configDirectory,
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
