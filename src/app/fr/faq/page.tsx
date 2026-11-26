import { FaqPage } from "@/components/pages/faq";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("faq", "fr");

export default function Page() {
  return <FaqPage lang="fr" />;
}
