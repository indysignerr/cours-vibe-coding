import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SessionList } from "./session-list";

export const metadata: Metadata = {
  title: "Sessions",
  robots: { index: false, follow: false },
};

export default function SessionsPage() {
  return (
    <PageShell
      eyebrow="Members"
      title="Session material"
      lede="Each session opens on the day it is taught, and stays open afterwards. Nothing is hidden from you once it has been taught."
    >
      <SessionList />
    </PageShell>
  );
}
