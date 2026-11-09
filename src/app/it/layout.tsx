import { RootShell, baseMetadata } from "@/components/root-shell";

// Layout racine de la langue « it » : <html lang="it"> dans le HTML servi.
export const metadata = baseMetadata("it");
export { viewport } from "@/components/root-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="it">{children}</RootShell>;
}
