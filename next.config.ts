import type { NextConfig } from "next";

// Cloudflare Pages : export statique, pas de runtime Node.
// Build command : npm run build   ·   Output directory : out
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
