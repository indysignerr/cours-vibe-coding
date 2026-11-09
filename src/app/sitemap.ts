import type { MetadataRoute } from "next";
import { getEvents, today } from "@/lib/events";
import {
  EN_ONLY,
  LOCALES,
  pagePath,
  type PageRef,
  type RouteKey,
} from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Le plan du site : chaque page, dans chacune de ses trois langues, avec
 * ses jumelles déclarées. /admin/ n'y est pas — il est derrière une
 * connexion.
 */
const PAGES: { page: RouteKey; priority: number; weekly?: boolean }[] = [
  { page: "home", priority: 1, weekly: true },
  { page: "programme", priority: 0.9, weekly: true },
  { page: "join", priority: 0.7 },
  { page: "team", priority: 0.7 },
];

const abs = (path: string) => `${SITE.url}${path}`;

function entries(
  page: PageRef,
  priority: number,
  changeFrequency: "weekly" | "monthly",
  now: Date,
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [l, abs(pagePath(page, l))]),
  );
  return LOCALES.map((lang) => ({
    url: abs(pagePath(page, lang)),
    lastModified: now,
    changeFrequency,
    // L'anglais est la version de référence ; les deux autres suivent.
    priority: lang === "en" ? priority : Math.round(priority * 80) / 100,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const day = today(now);

  const pages = PAGES.flatMap(({ page, priority, weekly }) =>
    entries(page, priority, weekly ? "weekly" : "monthly", now),
  );

  // Chaque date a sa page, donc sa ligne. Une date passée baisse de priorité
  // plutôt que de disparaître : la page reste une archive utile.
  const events = getEvents("en").flatMap((e) =>
    entries(
      { event: e.slug },
      (e.endDate ?? e.date) >= day ? 0.8 : 0.4,
      "weekly",
      now,
    ),
  );

  const english: MetadataRoute.Sitemap = [
    { url: abs(EN_ONLY.setup), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: abs(EN_ONLY.legal), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: abs(EN_ONLY.privacy), lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  return [...pages, ...events, ...english];
}

// Requis par Next 16 avec output: "export".
export const dynamic = "force-static";
