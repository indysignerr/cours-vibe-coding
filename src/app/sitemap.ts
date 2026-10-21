import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Pages publiques uniquement : l'espace membre est derrière une session. */
const PUBLIC = [
  { path: "", priority: 1 },
  { path: "/services", priority: 0.9 },
  { path: "/approach", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/team", priority: 0.7 },
  { path: "/join", priority: 0.7 },
  { path: "/programme", priority: 0.6 },
  { path: "/setup", priority: 0.5 },
  { path: "/contests", priority: 0.5 },
  { path: "/legal", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC.map(({ path, priority }) => ({
    url: `${SITE.url}${path}/`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority,
  }));
}

// Requis par Next 16 avec output: "export".
export const dynamic = "force-static";
