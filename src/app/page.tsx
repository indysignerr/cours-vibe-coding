import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { EVENT_KINDS, readableSpan, upcoming } from "@/lib/events";
import { OFFERS } from "@/lib/offers";
import { SITE } from "@/lib/site";

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

export default function Home() {
  const nextEvent = upcoming()[0];

  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Hero : ivoire, le pictogramme en grand en filigrane */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
            <p className="eyebrow eyebrow--accent rise">{SITE.eyebrow}</p>
            <h1 className="display-1 rise mt-5 max-w-[15ch] [animation-delay:60ms]">
              AI your lawyer can sign off on.
            </h1>
            <p className="lede rise mt-7 max-w-measure [animation-delay:120ms]">
              We automate the repetitive work inside your company, and we hand you the file that lets
              you deploy it. Fixed price, three weeks, and a clear answer on where your data goes.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:180ms]">
              <Link className="btn btn--primary" href="/contact/">
                Book a first conversation
              </Link>
              <Link className="btn btn--ghost" href="/solutions/">
                See the five solutions
              </Link>
            </div>

            {/* Trois repères factuels : le registre est le devis, pas la promesse */}
            <dl className="rise mt-16 grid max-w-3xl gap-8 border-t border-line pt-8 sm:grid-cols-3 [animation-delay:240ms]">
              {[
                ["Fixed price", "From \u20ac2,500. Thirty per cent on signature."],
                ["Three weeks", "Scoped to finish, demonstrated in ten minutes."],
                ["Your name on it", "Code, accounts and licences, yours from day one."],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="eyebrow eyebrow--accent">{term}</dt>
                  <dd className="mt-2.5 text-sm text-body">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* La question d'ouverture : crée le besoin sans rien vendre */}
        <section className="border-b border-line bg-sunken">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <div className="md:col-span-5">
              <span aria-hidden className="rule--brand block" />
              <p className="eyebrow mt-6">The question we open with</p>
              <h2 className="display-2 mt-4">
                Has anyone agreed to the AI tools already running in your company?
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="lede">
                In most companies the answer is no, and almost nobody knows it is a problem. Since
                2025, Italian law has required a union agreement or a labour inspectorate authorisation
                before any tool that <em>could</em> monitor staff. The breach is criminal, and the
                evidence it produces cannot be used.
              </p>
              <p className="mt-5">
                It is not the tool that triggers it, it is the capability. A customer platform is a
                work tool. The same platform with a productivity score per salesperson is something
                else entirely, and most directors have never been told.
              </p>
              <Link className="btn btn--quiet mt-6 -ml-2" href="/approach/">
                How we handle it
              </Link>
            </div>
          </div>
        </section>

        {/* Les solutions, en liste à filets */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Solutions</p>
                <h2 className="display-2 mt-4 max-w-[18ch]">Five engagements, fixed price.</h2>
              </div>
              <Link className="btn btn--ghost" href="/solutions/">
                Full scope and exclusions
              </Link>
            </div>

            <ul className="rows mt-12">
              {OFFERS.map((s) => (
                <li key={s.slug} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8">
                  <span className="counter md:col-span-1">{s.n}</span>
                  <h3 className="display-3 md:col-span-4">{s.title}</h3>
                  <p className="text-body md:col-span-5">{s.summary}</p>
                  <span className="tnum text-lg font-semibold tracking-[-0.02em] text-ink md:col-span-2 md:text-right">
                    {s.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Principes */}
        <section className="border-b border-line bg-sunken">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-24">
            <p className="eyebrow">How we work</p>
            <h2 className="display-2 mt-4 max-w-[22ch]">
              The method is the product. The software comes after.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <article key={p.title} className="bg-surface p-7 md:p-8">
                  <span aria-hidden className="rule--brand block" />
                  <h3 className="display-3 mt-5">{p.title}</h3>
                  <p className="mt-3 text-body">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Qui nous sommes, dit franchement */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24">
            <div className="md:col-span-5">
              <p className="eyebrow">Who you are hiring</p>
              <h2 className="display-2 mt-4">Students, and we say so first.</h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="lede">
                We are an association run by students of {SITE.school} in {SITE.campus}. That is why
                our prices are a fraction of an agency&rsquo;s, and it is why we are strict about what
                we take on.
              </p>
              <p className="mt-5">
                We refuse anything that decides about a person: CV screening, employee scoring, credit,
                health. Under the European AI regulation those uses turn an integrator into a provider,
                with conformity assessment and CE marking attached. They have no place in a student
                structure, and we would rather tell you in the first meeting than discover it in month
                three.
              </p>
              <Link className="btn btn--quiet mt-6 -ml-2" href="/about/">
                Meet the team
              </Link>
            </div>
          </div>
        </section>

        {/* Le prochain évènement : la preuve, et une porte d'entrée ouverte */}
        {nextEvent ? (
          <section className="border-b border-line bg-sunken">
            <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:items-center md:px-8 md:py-20">
              <div className="md:col-span-7">
                <p className="eyebrow">Next in the room</p>
                <h2 className="display-2 mt-4 max-w-[22ch]">
                  {EVENT_KINDS[nextEvent.kind].label}: {nextEvent.title}.
                </h2>
                <p className="tnum mt-4 text-sm text-muted">
                  {readableSpan(nextEvent)} · {nextEvent.location}
                </p>
                <p className="mt-5 max-w-measure text-body">{nextEvent.summary}</p>
              </div>
              <div className="md:col-span-4 md:col-start-9">
                <Link className="btn btn--brand w-full sm:w-auto" href="/events/">
                  See the events
                </Link>
                <p className="mt-3 text-sm text-muted">
                  {nextEvent.capacity ? `${nextEvent.capacity} seats` : "No cap"} · no account needed
                </p>
              </div>
            </div>
          </section>
        ) : null}

        {/* Appel final */}
        <section>
          <div className="mx-auto max-w-stage px-5 py-20 md:px-8 md:py-28">
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
                  what happens when it goes wrong. You get a written read on what is worth automating
                  and what is not. No obligation, and no slide deck.
                </p>
                <Link className="btn btn--brand mt-9" href="/contact/">
                  Book the conversation
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
