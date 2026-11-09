import type { Metadata } from "next";
import Link from "next/link";
import { Shell } from "@/components/shell";
import { shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — Albert School's student lab for AI and code`,
  },
  description:
    "Albert School's student lab for AI and code, in Milan. Workshops, crash courses, Build Lab and vibe coding tournaments, at least every two weeks. Free.",
};

/**
 * L'accueil, à nu : le nom, ce qu'il veut dire, ce qu'on fait, ce qui
 * vient. Tout le contenu vient du plan annuel ; rien n'est dessiné.
 */
export default function Home() {
  const next = upcoming();

  return (
    <Shell>
      <section>
        <p className="eyebrow eyebrow--accent">{SITE.eyebrow}</p>
        <h1 className="mt-3">{SITE.name}</h1>
        <p className="lede mt-4 max-w-[60ch]">
          Lab of Intelligent, Generative, Hands-on Technology. {SITE.tagline}
        </p>
        <p className="mt-4 max-w-[60ch]">
          Free. Beginners welcome. English first, with Italian and French.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn btn--primary" href="/events/">
            See the dates
          </Link>
          <Link className="btn btn--ghost" href="/join/">
            How to join
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <h2>What we do</h2>
        <ul className="rows mt-5">
          {PILLARS.map((p) => (
            <li key={p.key} id={p.key} className="py-4">
              <h3>
                {p.title} <span className="font-normal text-muted">— {p.verb}</span>
              </h3>
              <ul className="mt-2 grid gap-1">
                {p.formats.map((f) => (
                  <li key={f.name}>
                    <strong>{f.name}</strong> · {f.what}{" "}
                    <span className="text-muted">({f.length})</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2>Coming up</h2>
        <ol className="rows mt-5">
          {next.map((e) => (
            <li key={e.slug} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <time className="text-sm text-muted" dateTime={e.date}>
                {shortDate(e.date)}
              </time>
              <Link className="text-ink underline underline-offset-4" href={`/events/${e.slug}/`}>
                {e.title}
              </Link>
              <span className="text-sm text-muted">
                {e.format} · {e.audience}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <h2>Who runs it</h2>
        <p className="mt-4 max-w-[60ch]">
          A board of {SITE.team.length} students —{" "}
          {SITE.team.map((m) => m.name).join(", ")}. They run the workshops,
          book the rooms and bring in the partners.{" "}
          <Link className="text-accent underline underline-offset-4" href="/about/">
            Who we are
          </Link>
        </p>
      </section>
    </Shell>
  );
}
