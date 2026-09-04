import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SubmitForm } from "./submit-form";

export const metadata: Metadata = {
  title: "Submit a project",
  robots: { index: false, follow: false },
};

export default function SubmitPage() {
  return (
    <PageShell
      eyebrow="Members"
      title="Submit a project"
      lede="One submission per person per contest. Two links and three sentences, before midnight."
    >
      <SubmitForm />
    </PageShell>
  );
}
