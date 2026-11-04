import type { MetadataRoute } from "next";
import { EVENTS } from "@/lib/events";
import { SITE } from "@/lib/site";

/** Pages publiques uniquement : /admin/ est derrière une connexion. */
const PUBLIC = [
  { path: "", priority: 1 },
  { path: "/events", priority: 0.9 },
  { path: "/contact", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/join", priority: 0.7 },
  { path: "/setup", priority: 0.5 },
  { path: "/legal", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = PUBLIC.map(({ path, priority }) => ({
    url: `${SITE.url}${path}/`,
    lastModified: now,
    changeFrequency: path === "" || path === "/events" ? "weekly" : "monthly",
    priority,
  }));

  // Chaque date a sa page, donc sa ligne. Une date passée baisse de priorité
  // plutôt que de disparaître : la page reste une archive utile.
  const today = now.toISOString().slice(0, 10);
  const events: MetadataRoute.Sitemap = EVENTS.map((e) => ({
    url: `${SITE.url}/events/${e.slug}/`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: (e.endDate ?? e.date) >= today ? 0.8 : 0.4,
  }));

  return [...pages, ...events];
}

// Requis par Next 16 avec output: "export".
export const dynamic = "force-static";
