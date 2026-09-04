/**
 * Un seul endroit à éditer quand le nom de l'asso est arrêté.
 * Tout le reste du site lit ces valeurs.
 */
export const SITE = {
  name: "Vibe Coding Club", // PROVISOIRE
  shortName: "VCC", // PROVISOIRE
  school: "Albert School",
  eyebrow: "Student association at Albert School",
  legalMention:
    "A student association founded and run by two students at Albert School.",
  founders: [] as string[], // prénoms et noms des deux fondateurs, à remplir
  tagline: "Ship something real, every week.",
  url: "https://cours-vibe-coding.pages.dev",
  whatsapp: "" as string, // lien d'invitation WhatsApp, à remplir
  contactEmail: "" as string, // adresse publique de l'asso, obligatoire pour les pages légales
  startsWeekOf: "2026-09-14",
  weeks: 12,
  prizeEur: 50,
  contests: 3,
} as const;
