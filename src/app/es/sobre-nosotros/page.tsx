import { AboutPage } from "@/components/pages/about";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("about", "es");

export default function Page() {
  return <AboutPage lang="es" />;
}
