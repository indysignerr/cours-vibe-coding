import data from "@content/pillars.json";
import type { Locale } from "@/lib/i18n";

/**
 * Les quatre piliers et leurs formats, lus dans content/pillars.json.
 * Chaque chaîne vient de la table « What we offer » du plan annuel.
 */
export type PillarKey = "learn" | "build" | "compete" | "connect";

export type Pillar = {
  key: PillarKey;
  title: string;
  promise: string;
  formats: { name: string; what: string; length: string }[];
};

export function getPillars(lang: Locale = "en"): Pillar[] {
  return data.pillars.map((p) => ({
    key: p.key as PillarKey,
    title: p.title,
    promise: p.promise[lang],
    formats: p.formats.map((f) => ({
      name: f.name[lang],
      what: f.what[lang],
      length: f.length[lang],
    })),
  }));
}

export const PILLARS = getPillars("en");
