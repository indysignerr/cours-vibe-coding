import { IBM_Plex_Mono, Inter } from "next/font/google";

/**
 * Deux voix, pas une.
 *
 * La charte impose Inter, et Inter reste la voix de la marque : titres,
 * paragraphes, boutons. Mais une seule famille sur tout un site donne un
 * ton parfaitement plat — c'est l'un des trois signes qui faisaient
 * « site généré ».
 *
 * Le mono n'est pas un second caractère de marque, c'est un registre :
 * il sert aux chiffres, aux prix, aux dates, aux libellés et aux
 * références de loi. Partout où le site cite une donnée plutôt que de
 * parler. Plex Mono a des chiffres de même chasse et un dessin sobre qui
 * ne se bat pas avec Inter.
 */
export const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
