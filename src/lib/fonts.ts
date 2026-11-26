import { Albert_Sans, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Deux voix, et un registre pour le code.
 *
 * Newsreader porte les titres, les chapeaux et les grands chiffres : un
 * caractère de presse, dessiné pour être lu, qui donne au site le ton d'un
 * rapport plutôt que celui d'un gabarit. Il existe en plusieurs tailles
 * optiques ; le site en embarque deux, en fichiers locaux :
 *
 *   — `display`, la coupe de 72 points, pour les grands titres. C'est un
 *     fichier de 22 Ko, et c'est lui que le premier écran attend : la
 *     famille entière, avec son axe de taille optique, en pesait 129.
 *   — `serif`, la coupe de 20 points, pour les chapeaux, les intertitres
 *     et les titres d'événements. Graisses 400 et 500.
 *
 * Albert Sans porte le texte courant et l'interface : une grotesque
 * géométrique, lisible à 17 px, qui s'accorde aux capitales espacées du
 * logo. Ni Inter, ni Roboto, ni Arial : le CLAUDE.md du dépôt les exclut.
 *
 * Plex Mono ne sert qu'aux commandes de la page « Before you come ». Ni
 * lui ni la coupe de texte ne sont préchargés : ils ne disputent rien au
 * titre du premier écran.
 */
export const display = localFont({
  src: "../fonts/newsreader-display.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const serif = localFont({
  src: "../fonts/newsreader-text.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-serif",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const body = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});
