import type { Metadata } from "next";
import { HomeHero } from "@/components/home-hero";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { PhotoSlot } from "@/components/photo-slot";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";
import { EVENT_KINDS, readableSpan, upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "A student association at Albert School Milano. Hackathons, workshops and talks on what AI is doing to work — and the people doing it.",
};

const WHY = [
  {
    n: "01",
    title: "Your job is being rewritten while you study for it",
    body: "Not replaced. Rewritten. The people who understand how are the ones in the room when it happens.",
  },
  {
    n: "02",
    title: "You cannot read your way to it",
    body: "Every event ends with something that runs. Notes are not the output; a working thing with your name on it is.",
  },
  {
    n: "03",
    title: "The room is the point",
    body: "You meet people one step ahead of you, and people one step behind. Both are worth knowing in two years.",
  },
];

export default function Home() {
  const next = upcoming();
  const rest = next.slice(1, 4);

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* La pièce, l'ampoule, et l'affiche du prochain évènement. */}
        <HomeHero />

        {/* Pourquoi on existe. Le networking et l'IA au travail, en trois temps. */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
            <Reveal stagger y={18} className="max-w-[46rem]">
              <p className="eyebrow">Why we exist</p>
              <h2 className="display-2 mt-5">
                Nobody here is only listening.
              </h2>
            </Reveal>

            <Reveal as="ol" className="rows mt-14" stagger y={22}>
              {WHY.map((w) => (
                <li key={w.n} className="grid gap-4 py-9 first:pt-0 md:grid-cols-12 md:gap-8">
                  <span className="counter md:col-span-1">{w.n}</span>
                  <h3 className="display-3 md:col-span-4">{w.title}</h3>
                  <p className="text-body md:col-span-6 md:col-start-6">{w.body}</p>
                </li>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Les formats. Bord à bord sur le sable. */}
        <section className="border-b border-line bg-sunken">
          <div className="px-5 py-24 md:px-12 md:py-32">
            <Reveal stagger y={18} className="mb-14 max-w-[40rem]">
              <p className="eyebrow">What we run</p>
              <h2 className="display-2 mt-5">Four formats. No lectures.</h2>
            </Reveal>

            <Reveal
              as="dl"
              className="grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-4"
              stagger
              y={22}
            >
              {Object.entries(EVENT_KINDS).map(([key, k]) => (
                <div key={key} className="bg-canvas p-7">
                  <span aria-hidden className="rule--brand block" />
                  <dt className="display-3 mt-5">{k.label}</dt>
                  <dd className="mt-2.5 text-sm text-body">{k.blurb}</dd>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Ce qui suit, après le prochain. */}
        {rest.length > 0 ? (
          <section className="border-b border-line">
            <div className="mx-auto max-w-stage px-5 py-24 md:px-8 md:py-32">
              <Reveal className="flex flex-wrap items-end justify-between gap-6" stagger y={18}>
                <h2 className="display-2 max-w-[16ch]">And after that.</h2>
                <Magnetic strength={0.2}>
                  <Link className="btn btn--ghost" href="/events/">
                    Every date, and sign-up
                  </Link>
                </Magnetic>
              </Reveal>

              <Reveal as="ul" className="rows mt-14" stagger y={20}>
                {rest.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href="/events/"
                      className="group grid gap-3 py-7 md:grid-cols-12 md:items-baseline md:gap-8"
                    >
                      <span className="eyebrow eyebrow--accent md:col-span-2">
                        {EVENT_KINDS[e.kind].label}
                      </span>
                      <span className="display-3 underline-grow md:col-span-5">{e.title}</span>
                      <span className="tnum text-sm text-muted md:col-span-3">
                        {readableSpan(e)}
                      </span>
                      <span className="tnum text-sm text-muted md:col-span-2 md:text-right">
                        {e.capacity ? `${e.capacity} seats` : "No cap"}
                      </span>
                    </Link>
                  </li>
                ))}
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* Qui tient tout ça. */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-12 px-5 py-24 md:grid-cols-12 md:px-8 md:py-32">
            <Reveal className="md:col-span-5" stagger y={22}>
              <p className="eyebrow">Who runs it</p>
              <h2 className="display-2 mt-5 max-w-[14ch]">
                {SITE.team.length} students. No staff.
              </h2>
              <p className="lede mt-7">
                We write the briefs, book the room and answer the questions. That is the whole
                organisation.
              </p>
              <Link className="btn btn--quiet underline-grow mt-7 -ml-2" href="/about/">
                Meet them
              </Link>
            </Reveal>

            <Reveal className="md:col-span-6 md:col-start-7" y={24} delay={0.1}>
              <PhotoSlot
                ratio="4 / 3"
                label="The six of us at the campus, mid-hackathon. Taken on a phone, not bought."
              />
            </Reveal>
          </div>
        </section>

        {/* L'appel final. */}
        <section className="on-ink">
          <div className="mx-auto max-w-stage px-5 py-28 md:px-8 md:py-40">
            <Reveal stagger y={26} className="max-w-[44rem]">
              <p className="eyebrow eyebrow--accent">Coming along</p>
              <h2 className="display-1 mt-6 max-w-[13ch]">You do not have to join anything.</h2>
              <p className="lede mt-8">
                Put your name down for one event. That is the entire process — no account, no
                application, no subscription.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Magnetic>
                  <Link className="btn btn--primary" href="/events/">
                    Sign up for the next one
                  </Link>
                </Magnetic>
                <Link className="btn btn--outline" href="/join/">
                  What membership means
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
