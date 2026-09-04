import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ProfileView } from "./profile";

export const metadata: Metadata = {
  title: "Me",
  robots: { index: false, follow: false },
};

export default function MePage() {
  return (
    <PageShell eyebrow="Members" title="Your profile">
      <ProfileView />
    </PageShell>
  );
}
