import type { NextConfig } from "next";

// Cloudflare Pages : export statique, pas de runtime Node.
// Build command : npm run build   ·   Output directory : out
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  experimental: {
    // Trois layouts racine — un par langue, pour que <html lang> soit juste
    // dans le HTML servi. Il n'y a donc plus de layout unique d'où composer
    // la page 404 : elle vit dans app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
