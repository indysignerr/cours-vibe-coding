import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Board } from "./board";

export const metadata: Metadata = {
  title: "Season board",
  robots: { index: false, follow: false },
};

export default function LeaderboardPage() {
  return (
    <PageShell
      eyebrow="Season"
      title="The board"
      lede="Ten XP per checklist line, forty per contest submission. Six people, one semester. It resets in January."
    >
      <Board />
    </PageShell>
  );
}
