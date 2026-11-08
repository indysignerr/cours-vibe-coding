import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
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
 * leur demande. Pas de description rédigée par-dessus : ce sont des
 * tiers, et leur prêter un rôle qu'ils n'ont pas accepté serait pire
 * qu'inexact.
 */
const PARTNERS: [string, string][] = [
  [
    "Albert School",
    "Rooms, a small budget for prizes and snacks, event listings",
  ],
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
    <PageShell
      eyebrow="Who we are"
      title="A lab, not a club."
      lede="Lab of Intelligent, Generative, Hands-on Technology — a student association at Albert School in Milan, recognised by the school. Beginners welcome."
    >
      {/* Ce qu'on fait, en quatre mots. Le détail vit sur la page d'accueil. */}
      <section className="scroll-in">
        <p className="eyebrow">What we do</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {PILLARS.map((p) => (
            <li key={p.key}>
              <Link className="tag tag--link" href={`/#${p.key}`}>
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Le bureau. Sept lignes, pas sept portraits. */}
      <section className="mt-20 scroll-in">
        <p className="eyebrow">The board</p>
        <ol className="rows mt-6">
          {SITE.team.map((m) => (
            <li
              key={m.name}
              className="grid items-baseline gap-1 py-4 md:grid-cols-12 md:gap-6"
            >
              <span className="display-3 md:col-span-3">{m.name}</span>
              <span className="text-accent md:col-span-4">{m.role}</span>
              <span className="text-sm text-muted md:col-span-5 md:text-right">
                {m.focus}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Les partenaires. */}
      <section className="mt-20 scroll-in">
        <p className="eyebrow">Partners, and what we ask them for</p>
        <ol className="rows mt-6">
          {PARTNERS.map(([name, what]) => (
            <li
              key={name}
              className="grid gap-1 py-4 md:grid-cols-12 md:items-baseline md:gap-6"
            >
              <span className="display-3 md:col-span-5">{name}</span>
              <span className="text-sm text-body md:col-span-7">{what}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Les faits. */}
      <section className="mt-20 scroll-in">
        <p className="eyebrow">In short</p>
        <dl className="rows mt-6">
          {FACTS.map(([term, detail]) => (
            <div
              key={term}
              className="grid gap-1 py-4 md:grid-cols-12 md:items-baseline md:gap-6"
            >
              <dt className="eyebrow md:col-span-3">{term}</dt>
              <dd className="text-body md:col-span-9">{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-20 grid gap-10 md:grid-cols-12 scroll-in">
        <div className="md:col-span-5">
          <p className="eyebrow eyebrow--accent">Coming along</p>
          <h2 className="display-2 mt-4">Start with an open one.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="lede">
            Workshops, crash courses and the big nights are open to anyone at{" "}
            {SITE.school}. Tournaments and Build Lab are for members.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn--primary" href="/events/">
              See the dates
            </Link>
            <Link className="btn btn--ghost" href="/join/">
              How to join
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
