import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";

/**
 * Une voix de marque, et un registre pour les données.
 *
 * Le plan annuel demande « two colours, one font ». Inter ne pouvait pas
 * être cette police : le CLAUDE.md du dépôt l'interdit, et le jury
 * Awwwards la cite nommément comme signe de gabarit. Bricolage Grotesque
 * tient les deux bouts — un dessin à contre-formes irrégulières qui a du
 * caractère en très grand, et une graisse variable qui reste lisible à
 * 17 px. Une seule famille, donc, pour les titres comme pour le texte.
 *
 * Le mono n'est pas un second caractère de marque, c'est un registre :
 * il sert aux chiffres, aux prix, aux dates, aux libellés et aux
 * références de loi. Partout où le site cite une donnée plutôt que de
 * parler. Plex Mono a des chiffres de même chasse et un dessin sobre qui
 * ne se bat pas avec Inter.
 */
export const body = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-body",
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

// Les titres restent dans la voix de la marque.
export const display = body;
