import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { JudgeView } from "./judging";

export const metadata: Metadata = {
  title: "Judge",
  robots: { index: false, follow: false },
};

export default function JudgePage() {
  return (
    <PageShell eyebrow="Jury" title="Score the projects" lede="Every line is 0, 1 or 2. The gate is pass or fail. You score alone; totals are compared afterwards.">
      <JudgeView />
    </PageShell>
  );
}
