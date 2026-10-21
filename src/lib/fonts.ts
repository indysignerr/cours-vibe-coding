import { Inter } from "next/font/google";

/**
 * Une seule famille, imposée par la charte Albert L.I.G.H.T. :
 * titres en SemiBold, corps en Regular, libellés en Medium capitales.
 * Les chiffres sont en tabulaires pour que les prix et les dates s'alignent.
 */
export const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

// Les titres et le code partagent la même famille : la hiérarchie vient
// de la graisse, de la taille et du crénage, pas d'un deuxième caractère.
export const display = body;
export const mono = body;
