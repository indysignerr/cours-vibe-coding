import { JoinPage } from "@/components/pages/join";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("join", "it");

export default function Page() {
  return <JoinPage lang="it" />;
}
