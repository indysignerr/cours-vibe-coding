import type { Metadata } from "next";
import Link from "next/link";
import { HomeHero } from "@/components/home-hero";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Split } from "@/components/split";
import { YearTimeline } from "@/components/year-timeline";
import { upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "Albert School's student lab for AI and code, in Milan. Workshops, crash courses, Build Lab, vibe coding tournaments and open nights — something on at least every two weeks. Beginners welcome.",
};

export default function Home() {
  const next = upcoming();

  return (
    <>
      <SiteHeader />

      <main id="main">
        <HomeHero />

        {/* Les quatre piliers. Quatre lignes, pas quatre paragraphes : le
            détail de chaque format vit sur la page Events, et le survol
            suffit à montrer qu'il existe. */}
        <section className="on-ink border-b border-line" id="pillars">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-36">
            <p className="eyebrow eyebrow--accent scroll-fade">How it works</p>

            <ol className="pillars mt-12 scroll-stagger">
              {PILLARS.map((p, i) => (
                <li key={p.key} id={p.key}>
                  <Link className="pillar" href="/events/">
                    <span className="counter pillar__n">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pillar__name">{p.title}</span>
                    <span className="pillar__verb">{p.verb}</span>
                    <span className="pillar__formats">
                      {p.formats.map((f) => (
                        <span key={f.name} className="tag">
                          {f.name}
                        </span>
                      ))}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* La frise. La promesse des deux semaines, rendue visible. */}
        <section className="border-b border-line bg-sunken">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <div className="flex flex-wrap items-end justify-between gap-6 scroll-in">
              <div className="max-w-[34rem]">
                <p className="eyebrow">The year</p>
                <h2 className="display-2 mt-5">
                  <Split>November to May, without a gap.</Split>
                </h2>
              </div>
              <Link className="btn btn--ghost" href="/events/">
                Every date, and sign-up
              </Link>
            </div>

            <div className="mt-16">
              <YearTimeline events={next} />
            </div>

            <p className="mt-10 text-sm text-muted scroll-fade">
              Plus Build Lab every other Tuesday, from December through May.
            </p>
          </div>
        </section>

        {/* La bande. Rien d'écrit dessus : l'image a l'écran pour elle. */}
        <section aria-hidden className="band">
          <Image
            src="/images/scene-connect.webp"
            alt=""
            width={1408}
            height={768}
            className="band__img"
            sizes="100vw"
          />
        </section>

        {/* Qui tient tout ça. */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
            <div className="md:col-span-5 scroll-in">
              <p className="eyebrow">Who runs it</p>
              <h2 className="display-2 mt-5 max-w-[14ch]">
                A board of {SITE.team.length}.
              </h2>
              <p className="lede mt-7">
                Events are free this year. The only fixed cost is the domain
                renewal, and spending anything needs a majority of the board.
              </p>
              <Link
                className="btn btn--quiet underline-grow mt-7 -ml-2"
                href="/about/"
              >
                Meet the board
              </Link>
            </div>

            <div className="md:col-span-6 md:col-start-7 scroll-in">
              {/* Visuel d'ambiance, pas une photo du bureau : il n'y en a
                  pas encore. Le jour où il y en aura, elle prend cette place. */}
              <Image
                src="/images/scene-board.webp"
                alt=""
                width={1408}
                height={768}
                className="rounded-card w-full"
                sizes="(min-width: 768px) 46vw, 100vw"
              />
            </div>
          </div>
        </section>

        {/* L'appel final. */}
        <section className="on-ink">
          <div className="mx-auto max-w-stage px-5 py-28 md:px-8 md:py-40">
            <div className="max-w-[44rem] scroll-in">
              <p className="eyebrow eyebrow--accent">Coming along</p>
              <h2 className="display-1 mt-6 max-w-[13ch]">
                <Split>You do not have to join anything.</Split>
              </h2>
              <p className="lede mt-8">
                Put your name down for one event. No account, no application, no
                fee.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link className="btn btn--primary" href="/events/">
                  See what is on
                </Link>
                <Link className="btn btn--outline" href="/join/">
                  What membership means
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
