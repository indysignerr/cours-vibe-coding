import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ResultsView } from "./results";

export const metadata: Metadata = {
  title: "Results",
  robots: { index: false, follow: false },
};

export default function ResultsPage() {
  return (
    <PageShell eyebrow="Contests" title="Results" lede="The winner, a mention, and one honest sentence on every project submitted. Nobody who entered goes unmentioned.">
      <ResultsView />
    </PageShell>
  );
}
