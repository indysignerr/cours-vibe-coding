import { FaqPage } from "@/components/pages/faq";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("faq", "es");

export default function Page() {
  return <FaqPage lang="es" />;
}
