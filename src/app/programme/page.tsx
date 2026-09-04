import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { Path, type PathNode } from "@/components/path";
import { CURRICULUM } from "@/lib/curriculum";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "The path",
  description: `Twelve steps, from the week of ${SITE.startsWeekOf} to the end of November.`,
};

// Vue publique : tout est visible, rien n'est coché. Les vrais états
// vivent derrière la connexion, dans /sessions/.
const nodes: PathNode[] = CURRICULUM.map((entry, i) => ({
  ...entry,
  state: i === 0 ? "current" : "open",
  progress: 0,
}));

export default function ProgrammePage() {
  return (
    <PageShell
      eyebrow="Twelve weeks"
      title="Twelve steps. One path."
      lede="Each step introduces exactly one idea and ends with something you can show to someone. Finish its checklist, the ring fills, the next one unlocks. Three of the twelve are contests."
    >
      <Path nodes={nodes} />
      <p className="mx-auto mt-8 max-w-measure text-center text-base text-muted">
        Dates are the week, not the exact slot. The timetable is not out yet, so the day and time will
        be confirmed before the first session.
      </p>
    </PageShell>
  );
}
