import type { Metadata } from "next";
import Link from "next/link";
import { Stage } from "@/components/stage";
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
  ["Albert School", "Rooms, a small budget for prizes and snacks, listings"],
  ["Codemotion", "Co-organise the December workshop"],
  ["Floriano's team", "Co-organise the cinema night"],
  ["n8n or Lovable", "Credits and tournament prizes"],
  ["Albert Junior Consulting Enterprise", "A jury member at the tournaments"],
];

/** Chaque ligne est dans le plan. Rien d'autre ne figure ici. */
const FACTS: [string, string][] = [
  ["Campus", `${SITE.school} ${SITE.campus}`],
  ["Status", "Student association, recognised by the school"],
  ["Events", "At least one every two weeks, outside holidays"],
  ["Price", "Free"],
  ["Languages", "English first, with Italian and French"],
];

/**
 * Qui nous sommes : un écran, trois colonnes.
 *
 * Le nom développé à gauche, et à droite ce qu'on fait ; en dessous, le
 * bureau, les partenaires et les faits côte à côte plutôt qu'empilés.
 * Tout se lit d'un regard.
 */
export default function AboutPage() {
  return (
    <Stage className="stage--about">
      <div className="about__top">
        <header>
          <p className="eyebrow eyebrow--accent rise">Who we are</p>
          <h1 className="display-1 rise mt-4 [animation-delay:80ms]">
            A lab, not a club.
          </h1>
          <p className="lede rise mt-5 max-w-measure [animation-delay:160ms]">
            <strong>L</strong>ab of <strong>I</strong>ntelligent,{" "}
            <strong>G</strong>enerative, <strong>H</strong>ands-on{" "}
            <strong>T</strong>echnology — a student association at{" "}
            {SITE.school} in Milan, recognised by the school. Beginners
            welcome.
          </p>
        </header>

        {/* Ce qu'on fait, en quatre portes vers le volet de l'accueil. */}
        <ul className="doors rise [animation-delay:240ms]" aria-label="What we do">
          {PILLARS.map((p, i) => (
            <li key={p.key}>
              <Link className="door" href={`/#${p.key}`}>
                <span className="eyebrow eyebrow--accent">0{i + 1}</span>
                <span className="door__title">{p.title}</span>
                <span className="door__verb">{p.verb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="cols mt-auto">
        {/* Le bureau. Sept lignes, pas sept portraits. */}
        <section className="rise [animation-delay:320ms]">
          <p className="eyebrow">The board · {SITE.team.length}</p>
          <ol className="cols__list mt-3">
            {SITE.team.map((m) => (
              <li key={m.name}>
                <span className="text-ink">{m.name}</span>
                <span className="text-muted">{m.role}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rise [animation-delay:400ms]">
          <p className="eyebrow">Partners, and what we ask them for</p>
          <ol className="cols__list mt-3">
            {PARTNERS.map(([name, what]) => (
              <li key={name}>
                <span className="text-ink">{name}</span>
                <span className="text-muted">{what}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rise [animation-delay:480ms]">
          <p className="eyebrow">In short</p>
          <dl className="cols__list mt-3">
            {FACTS.map(([term, detail]) => (
              <div key={term}>
                <dt className="text-ink">{term}</dt>
                <dd className="text-muted">{detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn btn--primary" href="/events/">
              See the dates
            </Link>
            <Link className="btn btn--ghost" href="/join/">
              How to join
            </Link>
          </div>
        </section>
      </div>
    </Stage>
  );
}
