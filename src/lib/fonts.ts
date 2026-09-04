import { Instrument_Serif, JetBrains_Mono, Manrope } from "next/font/google";

// Choix provisoire, à rejouer avec le nom de l'asso.
// Sérif éditoriale en titrage, sans géométrique en courant, mono pour les
// prompts et les commandes, qui sont la partie la plus copiée du site.
export const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
