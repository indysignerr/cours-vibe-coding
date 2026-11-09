import { ProgrammePage } from "@/components/pages/programme";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("programme", "es");

export default function Page() {
  return <ProgrammePage lang="es" />;
}
