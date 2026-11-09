import { RootShell, baseMetadata } from "@/components/root-shell";

// Layout racine de la langue « es » : <html lang="es"> dans le HTML servi.
export const metadata = baseMetadata("es");
export { viewport } from "@/components/root-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="es">{children}</RootShell>;
}
