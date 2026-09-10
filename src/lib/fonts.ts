import { Bricolage_Grotesque, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

// Registre d'app, pas de magazine : un display trapu et un peu bizarre pour
// les gros chiffres et les titres, un courant rond et lisible, du mono pour
// les prompts et les commandes, qui sont la partie la plus copiée du site.
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "800"],
  variable: "--font-display",
  display: "swap",
});

export const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});
