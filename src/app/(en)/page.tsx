import { HomePage } from "@/components/pages/home";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("home", "en");

export default function Page() {
  return <HomePage lang="en" />;
}
