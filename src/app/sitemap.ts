import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Pages publiques uniquement : /admin/ est derrière une connexion. */
const PUBLIC = [
  { path: "", priority: 1 },
  { path: "/solutions", priority: 0.9 },
  { path: "/approach", priority: 0.8 },
  { path: "/contact", priority: 0.8 },
  { path: "/events", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/join", priority: 0.7 },
  { path: "/setup", priority: 0.5 },
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
