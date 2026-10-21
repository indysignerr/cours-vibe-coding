/**
 * Un seul endroit à éditer pour l'identité.
 *
 * ATTENTION : « Junior Enterprise » est une marque déposée. Tant que la
 * structure n'est pas reconnue par le réseau, ce terme ne doit apparaître
 * ni sur le site, ni dans un devis, ni sur LinkedIn. Voir junior/FORMALITES-IT.md.
 */
export const SITE = {
  name: "Albert L.I.G.H.T.",
  shortName: "Albert L.I.G.H.T.",
  school: "Albert School",
  campus: "Milano",
  eyebrow: "Student-run · Albert School Milano",
  legalMention:
    "A student-run association at Albert School Milano. Not affiliated with, endorsed by, or sponsored by the technology vendors named on this site.",
  tagline: "AI your lawyer can sign off on.",
  url: "https://cours-vibe-coding.pages.dev",

  /**
   * Développement de l'acronyme, à remplir par les fondateurs.
   * Tant que le tableau est vide, la section ne s'affiche pas : mieux vaut
   * ne rien dire que d'inventer ce que les lettres veulent dire.
   */
  acronym: [] as { letter: string; word: string; line: string }[],

  // Vides tant que l'adresse n'est pas créée. Les gabarits s'adaptent.
  whatsapp: "" as string,
  contactEmail: "" as string,

  /**
   * Google Agenda. Deux réglages indépendants :
   * — calendarId : l'agenda public de l'association, affiché sur /events/
   *   et proposé à l'abonnement. Format « xxxx@group.calendar.google.com ».
   * — bookingUrl : la page de rendez-vous Google (Appointment schedule) qui
   *   sert à réserver la première conversation depuis /contact/.
   * Laisser vide désactive proprement le bloc concerné, sans casser la page.
   */
  calendarId: "" as string,
  bookingUrl: "" as string,
  timezone: "Europe/Rome",

  founders: ["Indy Francois", "Benjamin Gros-Piron", "Rafa"],
  team: [
    { name: "Indy Francois", role: "Co-founder", focus: "Delivery and the build" },
    { name: "Benjamin Gros-Piron", role: "Co-founder", focus: "Scoping and method" },
    { name: "Rafa", role: "Co-founder", focus: "Compliance file" },
    { name: "Riccardo", role: "Client relations", focus: "Italian market" },
    { name: "Tomasso", role: "Client relations", focus: "Italian market" },
    { name: "Lucca", role: "Delivery", focus: "Automation and tooling" },
  ],
} as const;
