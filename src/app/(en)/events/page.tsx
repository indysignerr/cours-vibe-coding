import { ProgrammePage } from "@/components/pages/programme";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("programme", "en");

export default function Page() {
  return <ProgrammePage lang="en" />;
}
