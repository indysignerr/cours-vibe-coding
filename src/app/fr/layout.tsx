import { RootShell, baseMetadata } from "@/components/root-shell";

// Layout racine de la langue « fr » : <html lang="fr"> dans le HTML servi.
export const metadata = baseMetadata("fr");
export { viewport } from "@/components/root-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="fr">{children}</RootShell>;
}
