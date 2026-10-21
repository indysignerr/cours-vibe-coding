/**
 * Un seul endroit à éditer pour l'identité.
 *
 * Le nom public devient « AI-bert », sans « Vibe Coding » : un site destiné
 * à des entreprises ne peut pas porter un nom de club étudiant.
 *
 * ATTENTION : « Junior Enterprise » est une marque déposée. Tant que la
 * structure n'est pas reconnue par le réseau, ce terme ne doit apparaître
 * ni sur le site, ni dans un devis, ni sur LinkedIn. Voir junior/FORMALITES-IT.md.
 */
export const SITE = {
  name: "AI-bert",
  shortName: "AI-bert",
  school: "Albert School",
  campus: "Milano",
  eyebrow: "Student-run · Albert School Milano",
  legalMention:
    "A student-run association at Albert School Milano. Not affiliated with, endorsed by, or sponsored by the technology vendors named on this site.",
  tagline: "AI that your lawyer can sign off on.",
  url: "https://cours-vibe-coding.pages.dev",
  whatsapp: "" as string,
  contactEmail: "" as string,
  founders: ["Indy Francois", "Benjamin Gros-Piron", "Rafa"],
  team: [
    { name: "Indy Francois", role: "Co-founder" },
    { name: "Benjamin Gros-Piron", role: "Co-founder" },
    { name: "Rafa", role: "Co-founder" },
    { name: "Riccardo", role: "Client relations, Italian" },
    { name: "Tomasso", role: "Client relations, Italian" },
    { name: "Lucca", role: "Delivery" },
  ],
  startsWeekOf: "2026-09-14",
  weeks: 12,
  prizeEur: 50,
  contests: 3,
} as const;
