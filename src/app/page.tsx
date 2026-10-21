import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { AnimatedMark } from "@/components/motion/animated-mark";
import { Counter } from "@/components/motion/counter";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { Reveal } from "@/components/motion/reveal";
import { SplitLines } from "@/components/motion/split-lines";
import { Tilt } from "@/components/motion/tilt";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WorkIndex } from "@/components/work-index";
import { EVENT_KINDS, readableSpan, upcoming } from "@/lib/events";
import { OFFERS } from "@/lib/offers";
import { SITE } from "@/lib/site";
import { WORK } from "@/lib/work";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description:
    "We automate the repetitive work inside your company with AI, and we hand you the compliance file that lets you deploy it. A student-run association at Albert School Milano.",
};

const PRINCIPLES = [
  {
    title: "We sort your data before we choose a tool",
    body: "Public, internal, personal, sensitive. Four categories, one page, one hour. The answer decides whether your project runs on a European service, on your own machines, or not at all.",
  },
  {
    title: "Sometimes the honest answer is no AI",
    body: "On some processes a plain rule is better, and on some the data is too sensitive to touch. Saying so in the first meeting is what separates an advisor from a vendor.",
  },
  {
    title: "We implement, we never certify",
    body: "We work to the rules and we document our choices. Your compliance stays yours and your counsel’s. We are not lawyers, and we will not pretend to be.",
  },
];

const TICKER = [
  "Fixed price",
  "Three weeks",
  "Hosted in the EU",
  "Your code, your accounts",
  "No conformity theatre",
  "We say no to high-risk uses",
  "Milano",
];

export default function Home() {
  const nextEvent = upcoming()[0];

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Hero : le titre monte mot à mot, le pictogramme s'allume à côté */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-12 px-5 pb-16 pt-14 md:grid-cols-12 md:items-center md:px-8 md:pb-24 md:pt-20">
            <div className="md:col-span-7">
              <Reveal as="p" className="eyebrow eyebrow--accent" y={14}>
                {SITE.eyebrow}
              </Reveal>
              <SplitLines
                text="AI your lawyer can sign off on."
                className="display-1 mt-5 max-w-[15ch]"
                delay={0.1}
              />
              <Reveal as="p" className="lede mt-7 max-w-measure" delay={0.5} y={18}>
                We automate the repetitive work inside your company, and we hand you the file that
                lets you deploy it. Fixed price, three weeks, and a clear answer on where your data
                goes.
              </Reveal>
              <Reveal className="mt-9 flex flex-wrap items-center gap-3" delay={0.65} y={16}>
                <Magnetic>
                  <Link className="btn btn--primary" href="/contact/">
                    Book a first conversation
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Link className="btn btn--ghost" href="/work/">
                    See what we have shipped
                  </Link>
                </Magnetic>
              </Reveal>
            </div>

            <div className="flex justify-center md:col-span-4 md:col-start-9">
              <AnimatedMark className="size-48 md:size-64" delay={0.3} />
            </div>
          </div>

          {/* Trois repères, comptés à l'arrivée */}
          <div className="mx-auto max-w-stage px-5 md:px-8">
            <Reveal
              className="grid gap-8 border-t border-line py-10 sm:grid-cols-3"
              stagger
              y={18}
            >
              <div>
                <p className="display-2">
                  <Counter to={2500} prefix="€" />
                </p>
                <p className="mt-2 text-sm text-body">
                  The entry engagement. Thirty per cent on signature, the balance on acceptance.
                </p>
              </div>
              <div>
                <p className="display-2">
                  <Counter to={3} suffix=" weeks" />
                </p>
                <p className="mt-2 text-sm text-body">
                  Every engagement, scoped to finish and demonstrated in ten minutes.
                </p>
              </div>
              <div>
                <p className="display-2">
                  <Counter to={WORK.length} suffix=" live sites" />
                </p>
                <p className="mt-2 text-sm text-body">
                  Not mock-ups. Public URLs you can open right now, built by our members.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Bandeau défilant : le ton, en sept mots */}
        <div className="border-b border-line bg-ink-surface py-4 text-sm font-medium uppercase tracking-[0.14em] text-on-ink">
          <Marquee items={TICKER} speed={44} />
        </div>

        {/* La preuve, avant l'argumentaire */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-24">
            <Reveal className="flex flex-wrap items-end justify-between gap-6" stagger y={20}>
              <div>
                <p className="eyebrow">Shipped, and still online</p>
                <h2 className="display-2 mt-4 max-w-[20ch]">
                  You can open every one of these right now.
                </h2>
              </div>
              <Magnetic strength={0.2}>
                <Link className="btn btn--ghost" href="/work/">
                  The whole list
                </Link>
              </Magnetic>
            </Reveal>

            <Reveal className="mt-12" y={30}>
              <WorkIndex />
            </Reveal>
          </div>
        </section>

        {/* La question d'ouverture */}
        <section className="border-b border-line bg-sunken">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <Reveal className="md:col-span-5" y={24}>
              <span aria-hidden className="rule--brand block" />
              <p className="eyebrow mt-6">The question we open with</p>
              <h2 className="display-2 mt-4">
                Has anyone agreed to the AI tools already running in your company?
              </h2>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" stagger y={24}>
              <p className="lede">
                In most companies the answer is no, and almost nobody knows it is a problem. Since
                2025, Italian law has required a union agreement or a labour inspectorate
                authorisation before any tool that <em>could</em> monitor staff. The breach is
                criminal, and the evidence it produces cannot be used.
              </p>
              <p className="mt-5">
                It is not the tool that triggers it, it is the capability. A customer platform is a
                work tool. The same platform with a productivity score per salesperson is something
                else entirely, and most directors have never been told.
              </p>
              <Link className="btn btn--quiet mt-6 -ml-2 underline-grow" href="/approach/">
                How we handle it
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Les solutions */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-24">
            <Reveal className="flex flex-wrap items-end justify-between gap-6" stagger y={20}>
              <div>
                <p className="eyebrow">Solutions</p>
                <h2 className="display-2 mt-4 max-w-[18ch]">Five engagements, fixed price.</h2>
              </div>
              <Magnetic strength={0.2}>
                <Link className="btn btn--ghost" href="/solutions/">
                  Full scope and exclusions
                </Link>
              </Magnetic>
            </Reveal>

            <Reveal as="ul" className="rows mt-12" stagger y={22}>
              {OFFERS.map((s) => (
                <li
                  key={s.slug}
                  className="group grid gap-4 py-8 md:grid-cols-12 md:gap-8"
                >
                  <span className="counter md:col-span-1">{s.n}</span>
                  <h3 className="display-3 underline-grow w-fit md:col-span-4">{s.title}</h3>
                  <p className="text-body md:col-span-5">{s.summary}</p>
                  <span className="tnum text-lg font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent md:col-span-2 md:text-right">
                    {s.price}
                  </span>
                </li>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Principes, en cartes qui s'inclinent */}
        <section className="border-b border-line bg-sunken">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-24">
            <Reveal stagger y={20}>
              <p className="eyebrow">How we work</p>
              <h2 className="display-2 mt-4 max-w-[22ch]">
                The method is the product. The software comes after.
              </h2>
            </Reveal>
            <Reveal className="mt-12 grid gap-5 md:grid-cols-3" stagger y={28}>
              {PRINCIPLES.map((p) => (
                <Tilt key={p.title} className="h-full">
                  <article className="card lift-on-hover h-full p-7 md:p-8">
                    <span aria-hidden className="rule--brand block" />
                    <h3 className="display-3 mt-5">{p.title}</h3>
                    <p className="mt-3 text-body">{p.body}</p>
                  </article>
                </Tilt>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Qui nous sommes */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <Reveal className="md:col-span-5" y={24}>
              <p className="eyebrow">Who you are hiring</p>
              <h2 className="display-2 mt-4">Students, and we say so first.</h2>
            </Reveal>
            <Reveal className="md:col-span-6 md:col-start-7" stagger y={24}>
              <p className="lede">
                We are an association run by students of {SITE.school} in {SITE.campus}. That is why
                our prices are a fraction of an agency&rsquo;s, and it is why we are strict about
                what we take on.
              </p>
              <p className="mt-5">
                We refuse anything that decides about a person: CV screening, employee scoring,
                credit, health. Under the European AI regulation those uses turn an integrator into a
                provider, with conformity assessment and CE marking attached. They have no place in a
                student structure, and we would rather tell you in the first meeting than discover it
                in month three.
              </p>
              <Link className="btn btn--quiet mt-6 -ml-2 underline-grow" href="/about/">
                Meet the team
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Le prochain évènement */}
        {nextEvent ? (
          <section className="border-b border-line bg-sunken">
            <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:items-center md:px-8 md:py-20">
              <Reveal className="md:col-span-7" stagger y={22}>
                <p className="eyebrow">Next in the room</p>
                <h2 className="display-2 mt-4 max-w-[22ch]">
                  {EVENT_KINDS[nextEvent.kind].label}: {nextEvent.title}.
                </h2>
                <p className="tnum mt-4 text-sm text-muted">
                  {readableSpan(nextEvent)} · {nextEvent.location}
                </p>
                <p className="mt-5 max-w-measure text-body">{nextEvent.summary}</p>
              </Reveal>
              <Reveal className="md:col-span-4 md:col-start-9" y={22} delay={0.1}>
                <Magnetic>
                  <Link className="btn btn--brand w-full sm:w-auto" href="/events/">
                    See the events
                  </Link>
                </Magnetic>
                <p className="mt-3 text-sm text-muted">
                  {nextEvent.capacity ? `${nextEvent.capacity} seats` : "No cap"} · no account needed
                </p>
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* Appel final */}
        <section>
          <div className="mx-auto max-w-stage px-5 py-20 md:px-8 md:py-28">
            <Reveal y={34}>
              <div className="card card--ink relative overflow-hidden px-7 py-14 md:px-16 md:py-20">
                <BrandMark
                  className="pointer-events-none absolute -bottom-16 -right-12 size-80 opacity-[0.08] md:size-96"
                  outline="var(--on-ink)"
                  glyph="var(--brand)"
                />
                <div className="relative">
                  <p className="eyebrow eyebrow--on-ink">First step</p>
                  <h2 className="display-2 mt-4 max-w-[20ch]" style={{ color: "var(--on-ink)" }}>
                    Forty-five minutes, and we do not talk about AI.
                  </h2>
                  <p className="lede mt-6 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
                    We ask what your week looks like, which task makes you sigh, how long it takes and
                    what happens when it goes wrong. You get a written read on what is worth
                    automating and what is not. No obligation, and no slide deck.
                  </p>
                  <Magnetic>
                    <Link className="btn btn--brand mt-9" href="/contact/">
                      Book the conversation
                    </Link>
                  </Magnetic>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
