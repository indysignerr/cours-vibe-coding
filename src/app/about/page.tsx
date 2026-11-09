import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, Shell } from "@/components/shell";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Who we are",
  description:
    "Albert L.I.G.H.T. — Lab of Intelligent, Generative, Hands-on Technology — is the student lab for AI and code at Albert School Milano, recognised by the school.",
  openGraph: {
    images: [
      { url: "/og/about.png", width: 1200, height: 630, alt: "Who we are" },
    ],
  },
};

/**
 * Les partenaires, dans l'ordre du plan, avec ce que le plan dit qu'on
 * leur demande. Pas de description rédigée par-dessus.
 */
const PARTNERS: [string, string][] = [
  ["Albert School", "Rooms, a small budget for prizes and snacks, event listings"],
  ["Codemotion", "Co-organise the December workshop"],
  ["Floriano's team", "Co-organise the cinema night"],
  ["n8n or Lovable", "Credits and tournament prizes"],
  ["Albert Junior Consulting Enterprise", "A jury member at the tournaments"],
];

/** Chaque ligne est dans le plan. Rien d'autre ne figure ici. */
const FACTS: [string, string][] = [
  ["Campus", `${SITE.school} ${SITE.campus}`],
  ["Status", "Student association, recognised by the school"],
  ["Board", `${SITE.team.length} members`],
  ["Events", "At least one every two weeks, outside holidays"],
  ["Price", "Free"],
  ["Languages", "English first, with Italian and French"],
];

export default function AboutPage() {
  return (
    <Shell>
      <PageHead
        eyebrow="Who we are"
        title="A lab, not a club."
        lede="Lab of Intelligent, Generative, Hands-on Technology — a student association at Albert School in Milan, recognised by the school. Beginners welcome."
      />

      <section>
        <h2>What we do</h2>
        <ul className="rows mt-3">
          {PILLARS.map((p) => (
            <li key={p.key} className="py-3">
              <Link className="text-ink underline underline-offset-4" href={`/#${p.key}`}>
                {p.title}
              </Link>{" "}
              <span className="text-muted">— {p.verb}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2>The board</h2>
        <ol className="rows mt-3">
          {SITE.team.map((m) => (
            <li key={m.name} className="flex flex-wrap gap-x-4 py-3">
              <span className="text-ink">{m.name}</span>
              <span className="text-muted">
                {m.role} · {m.focus}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2>Partners, and what we ask them for</h2>
        <ol className="rows mt-3">
          {PARTNERS.map(([name, what]) => (
            <li key={name} className="py-3">
              <span className="text-ink">{name}</span>{" "}
              <span className="text-muted">— {what}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2>In short</h2>
        <dl className="rows mt-3">
          {FACTS.map(([term, detail]) => (
            <div key={term} className="flex flex-wrap gap-x-4 py-3">
              <dt className="w-28 text-muted">{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 flex flex-wrap gap-3">
        <Link className="btn btn--primary" href="/events/">
          See the dates
        </Link>
        <Link className="btn btn--ghost" href="/join/">
          How to join
        </Link>
      </section>
    </Shell>
  );
}
