import { FaqPage } from "@/components/pages/faq";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("faq", "it");

export default function Page() {
  return <FaqPage lang="it" />;
}
