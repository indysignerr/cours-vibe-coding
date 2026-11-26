import { AboutPage } from "@/components/pages/about";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("about", "it");

export default function Page() {
  return <AboutPage lang="it" />;
}
