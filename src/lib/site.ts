import site from "@content/site.json";
import team from "@content/team.json";

/**
 * L'identité, lue dans content/site.json et content/team.json.
 *
 * Rien n'est écrit ici : ce fichier ne fait que donner une forme typée
 * aux données, pour que le reste du code ne lise pas le JSON à la main.
 *
 * ATTENTION : « Junior Enterprise » est une marque déposée. Tant que la
 * structure n'est pas reconnue par le réseau, ce terme ne doit apparaître
 * ni sur le site, ni dans un devis, ni sur LinkedIn.
 */
export const SITE = {
  name: site.name,
  expansion: site.expansion,
  school: site.school,
  campus: site.campus,
  url: site.url,
  domain: site.domain,
  tagline: site.tagline,
  legalMention: site.legalMention,
  timezone: site.timezone,
  /** L'adresse de contact, et si le routage est en place. */
  contactEmail: site.email.address,
  emailActive: site.email.active,
  social: site.social,
  founders: site.founders,
  googleSiteVerification: site.googleSiteVerification,
  calendarId: site.calendarId,
  whatsapp: site.whatsapp,
  bookingUrl: site.bookingUrl,
  /** Le bureau, en anglais : pour les pages qui n'existent que dans cette langue. */
  team: team.board.map((m) => ({
    name: m.name,
    role: m.role.en,
    focus: m.focus?.en ?? "",
  })),
};
