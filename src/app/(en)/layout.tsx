import { RootShell, baseMetadata } from "@/components/root-shell";

// Layout racine de la langue « en » : <html lang="en"> dans le HTML servi.
export const metadata = baseMetadata("en");
export { viewport } from "@/components/root-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
