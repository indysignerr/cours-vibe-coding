import { HomePage } from "@/components/pages/home";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("home", "fr");

export default function Page() {
  return <HomePage lang="fr" />;
}
