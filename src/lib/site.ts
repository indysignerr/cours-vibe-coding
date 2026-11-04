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
  /**
   * Deux temps, parce que l'association fait deux choses : on se rencontre,
   * et on comprend ce que l'IA est en train de faire au travail. Une
   * tagline qui ne dirait que la seconde serait un cours ; que la première,
   * un club.
   */
  tagline: "Understand AI at work. Meet the people building with it.",
  /**
   * Le domaine de production.
   *
   * Pilote le sitemap, le robots.txt, les URL canoniques, les images de
   * partage et le lien de réinitialisation de mot de passe. L'adresse
   * *.pages.dev reste servie par Cloudflare et on ne peut pas l'éteindre :
   * c'est la balise canonique, construite à partir d'ici, qui dit à Google
   * laquelle des deux fait foi.
   */
  url: "https://albertlight.com",

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

  /**
   * Le bureau, tel qu'il figure au plan annuel. Les rôles « Tech » sont
   * ouverts : le plan dit que les autres restent à préciser.
   */
  team: [
    { name: "Benjamin", role: "Lead", focus: "Overall organisation" },
    { name: "Jiali", role: "Social media", focus: "Instagram and LinkedIn" },
    { name: "Asia", role: "Secretary", focus: "Minutes and the shared sheet" },
    { name: "Lucca", role: "Tech", focus: "Open-ended" },
    { name: "Riccardo", role: "Tech", focus: "Open-ended" },
    { name: "Indy", role: "Tech", focus: "Open-ended" },
    { name: "Rafa", role: "Tech", focus: "Open-ended" },
  ],
} as const;
