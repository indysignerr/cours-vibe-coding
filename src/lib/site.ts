/**
 * Un seul endroit à éditer quand le nom de l'asso est arrêté.
 * Tout le reste du site lit ces valeurs.
 */
export const SITE = {
  name: "Vibe Coding Club", // PROVISOIRE
  shortName: "VCC", // PROVISOIRE
  school: "Albert School",
  legalMention: "An independent student association at Albert School.",
  tagline: "Ship something real, every week.",
  url: "https://cours-vibe-coding.pages.dev",
  whatsapp: "" as string, // lien d'invitation WhatsApp, à remplir
  contactEmail: "" as string, // adresse publique de l'asso, obligatoire pour les pages légales
  startsWeekOf: "2026-09-14",
  weeks: 12,
  prizeEur: 50,
  contests: 3,
} as const;
