import { Geist, Geist_Mono, Newsreader } from "next/font/google";

/**
 * Registre : cabinet de conseil, pas startup.
 *
 * Newsreader en titrage, à graisse légère et interlettrage serré. Une serif
 * de lecture, pas une serif d'affiche : elle signale le conseil sans crier.
 * C'est ce qui nous distingue de toutes les sociétés d'IA, qui utilisent
 * toutes la même grotesque.
 *
 * Geist en courant et en technique. Précis, neutre, excellent en petites
 * tailles, et sa variante mono sert aux libellés techniques.
 */
export const display = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const body = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
