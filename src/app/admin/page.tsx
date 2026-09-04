import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { AdminPanel } from "./admin-panel";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell eyebrow="Organisers" title="Club admin">
      <AdminPanel />
    </PageShell>
  );
}
