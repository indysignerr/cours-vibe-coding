import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { CURRICULUM } from "@/lib/curriculum";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Programme",
  description: `The twelve sessions, from ${SITE.startsWeekOf} to the end of November.`,
};

const WEEK = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });

export default function ProgrammePage() {
  return (
    <PageShell
      eyebrow="Twelve weeks"
      title="One hour a week, twelve visible wins."
      lede="Each session introduces exactly one idea and ends with something you can show to someone. Three of the twelve are contests."
    >
      <ol className="grid gap-px overflow-hidden rounded-lg bg-line">
        {CURRICULUM.map((entry) => {
          const isContest = entry.kind === "contest";
          return (
            <li
              key={entry.slug}
              className={`grid gap-4 p-6 md:grid-cols-12 md:items-baseline md:gap-8 md:p-8 ${
                isContest ? "bg-ink text-paper" : "bg-surface"
              }`}
            >
              <div className="md:col-span-2">
                <span className="font-mono text-sm tabular-nums">
                  {String(entry.number).padStart(2, "0")}
                </span>
                <span
                  className={`ml-3 font-mono text-xs uppercase tracking-wider md:ml-0 md:block md:mt-2 ${
                    isContest ? "text-paper/70" : "text-muted"
                  }`}
                >
                  {WEEK.format(new Date(entry.weekOf))}
                </span>
              </div>

              <h2 className="font-display text-display-md md:col-span-5">{entry.title}</h2>

              <p
                className={`text-base md:col-span-5 ${isContest ? "text-paper/80" : "text-muted"}`}
              >
                {entry.promise}
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-10 max-w-measure text-base text-muted">
        Dates are the week, not the exact slot. The timetable is not out yet, so the day and time
        will be confirmed before the first session.
      </p>
    </PageShell>
  );
}
