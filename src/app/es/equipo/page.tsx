import { TeamPage } from "@/components/pages/team";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("team", "es");

export default function Page() {
  return <TeamPage lang="es" />;
}
