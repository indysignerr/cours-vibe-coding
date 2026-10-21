/**
 * Les sites en ligne, vérifiables.
 *
 * C'est la seule preuve qui compte pour une entreprise : une URL qu'elle
 * peut ouvrir. Rien ici n'est une maquette. Si un site sort de ligne, on
 * le retire de cette liste plutôt que de laisser un lien mort.
 */
export type Work = {
  name: string;
  /** Le domaine, affiché tel quel. */
  domain: string;
  url: string;
  sector: string;
  year: string;
  /** Ce qui a été construit, en une phrase. */
  built: string;
  /** Ce que ça a changé, sans chiffre inventé. */
  result: string;
  /** La couleur dominante du site, pour l'aperçu au survol. */
  accent: string;
  surface: string;
  ink: string;
};

export const WORK: Work[] = [
  {
    name: "L'Ovive",
    domain: "lovive.fr",
    url: "https://lovive.fr",
    sector: "Restaurant · Biot",
    year: "2026",
    built:
      "Site vitrine avec la carte éditable par le gérant, sans développeur : il change un prix, un plat ou une photo depuis son téléphone, et le site est à jour en une minute.",
    result: "The owner has not asked us to change anything since handover. That is the measure.",
    accent: "#b4441f",
    surface: "#1c1a18",
    ink: "#f6f1e8",
  },
  {
    name: "NAYUMA",
    domain: "nayumatea.com",
    url: "https://nayumatea.com",
    sector: "Tea · wholesale and retail",
    year: "2026",
    built:
      "A catalogue site for a tea house selling to both professionals and the public, with seasonal collections and a sixty-day payment banner for trade customers.",
    result: "Two audiences, one site, and no confusion about which prices apply to whom.",
    accent: "#8a6a3c",
    surface: "#f7f2ea",
    ink: "#2c2318",
  },
  {
    name: "MANIKA.LAB",
    domain: "manika-bkh.pages.dev",
    url: "https://manika-bkh.pages.dev",
    sector: "Professional hair colour",
    year: "2026",
    built:
      "A product site for a professional colour range sold to salons: the shade system, the technical sheets, and a contact route that a salon owner will actually use.",
    result: "A brand that looks like the product rather than like a template.",
    accent: "#9a2f4e",
    surface: "#faf7f7",
    ink: "#241419",
  },
  {
    name: "Albert Maths",
    domain: "albert-maths.pages.dev",
    url: "https://albert-maths.pages.dev",
    sector: "Education",
    year: "2026",
    built:
      "A tool that explains why an answer is wrong instead of just marking it wrong. Built for students who are tired of a red cross with no sentence after it.",
    result: "Written, deployed and iterated by students, which is the whole point.",
    accent: "#1f5f8b",
    surface: "#f3f6f9",
    ink: "#10243a",
  },
  {
    name: "Indysigner",
    domain: "indysigner.fr",
    url: "https://indysigner.fr",
    sector: "Studio",
    year: "2025",
    built:
      "The studio site of one of our founders, built on the promise it sells: a site in ten days, and the ten days are kept.",
    result: "Where several of the engagements above came from.",
    accent: "#c06a52",
    surface: "#fbf9f6",
    ink: "#1b2033",
  },
];
