import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
    body: "We work to the rules and we document our choices. Your compliance stays yours and your counsel's. We are not lawyers, and we will not pretend to be.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-stage px-5 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
            <p className="eyebrow eyebrow--accent rise">{SITE.eyebrow}</p>
            <h1 className="display-1 rise mt-5 max-w-[16ch] [animation-delay:60ms]">
              AI that your lawyer can sign off on.
            </h1>
            <p className="lede rise mt-7 max-w-measure [animation-delay:120ms]">
              We automate the repetitive work inside your company, and we hand you the file that lets
              you deploy it. Fixed price, three weeks, and a clear answer on where your data goes.
            </p>
            <div className="rise mt-9 flex flex-wrap items-center gap-3 [animation-delay:180ms]">
              <Link className="btn btn--primary" href="/contact/">
                Book a first conversation
              </Link>
              <Link className="btn btn--ghost" href="/services/">
                See the five services
              </Link>
            </div>
          </div>
        </section>

        {/* La question d'ouverture : crée le besoin sans rien vendre */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
            <div className="md:col-span-5">
              <p className="eyebrow">The question we open with</p>
              <h2 className="display-2 mt-4">
                Has anyone agreed to the AI tools already running in your company?
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="lede">
                In most companies the answer is no, and almost nobody knows it is a problem. Since 2025,
                Italian law has required a union agreement or a labour inspectorate authorisation before
                any tool that <em>could</em> monitor staff. The breach is criminal, and the evidence it
                produces cannot be used.
              </p>
              <p className="mt-5">
                It is not the tool that triggers it, it is the capability. A customer platform is a work
                tool. The same platform with a productivity score per salesperson is something else
                entirely, and most directors have never been told.
              </p>
              <Link className="btn btn--quiet mt-6 -ml-2" href="/approach/">
                How we handle it
              </Link>
            </div>
          </div>
        </section>

        {/* Services, en liste à filets */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow">Services</p>
                <h2 className="display-2 mt-4 max-w-[18ch]">Five engagements, fixed price.</h2>
              </div>
              <Link className="btn btn--ghost" href="/services/">
                Full scope and exclusions
              </Link>
            </div>

            <ul className="rows mt-12">
              {OFFERS.map((s) => (
                <li key={s.slug} className="grid gap-4 py-8 md:grid-cols-12 md:gap-8">
                  <span className="font-mono text-sm text-muted md:col-span-1">{s.n}</span>
                  <h3 className="display-3 md:col-span-4">{s.title}</h3>
                  <p className="text-body md:col-span-5">{s.summary}</p>
                  <span className="font-mono text-sm text-ink md:col-span-2 md:text-right">
                    {s.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Principes */}
        <section className="border-b border-line">
          <div className="mx-auto max-w-stage px-5 py-16 md:px-8 md:py-20">
            <p className="eyebrow">How we work</p>
            <h2 className="display-2 mt-4 max-w-[22ch]">
              The method is the product. The software comes after.
            </h2>
            <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-3">
              {PRINCIPLES.map((p) => (
                <article key={p.title} className="bg-surface p-7 md:p-8">
                  <h3 className="display-3">{p.title}</h3>
                  <p className="mt-3 text-body">{p.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Qui nous sommes, dit franchement */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto grid max-w-stage gap-10 px-5 py-16 md:grid-cols-12 md:px-8 md:py-20">
            <div className="md:col-span-5">
              <p className="eyebrow">Who you are hiring</p>
              <h2 className="display-2 mt-4">Students, and we say so first.</h2>
            </div>
            <div className="md:col-span-6 md:col-start-7">
              <p className="lede">
                We are an association run by students of {SITE.school} in {SITE.campus}. That is why our
                prices are a fraction of an agency, and it is why we are strict about what we take on.
              </p>
              <p className="mt-5">
                We refuse anything that decides about a person: CV screening, employee scoring, credit,
                health. Under the European AI regulation those uses turn an integrator into a provider,
                with conformity assessment and CE marking attached. They have no place in a student
                structure, and we would rather tell you in the first meeting than discover it in month
                three.
              </p>
              <Link className="btn btn--quiet mt-6 -ml-2" href="/team/">
                Meet the team
              </Link>
            </div>
          </div>
        </section>

        {/* Appel final */}
        <section>
          <div className="mx-auto max-w-stage px-5 py-20 md:px-8 md:py-28">
            <div className="card card--ink px-7 py-14 md:px-16 md:py-20">
              <p className="eyebrow" style={{ color: "var(--on-ink-muted)" }}>
                First step
              </p>
              <h2 className="display-2 mt-4 max-w-[20ch]" style={{ color: "var(--on-ink)" }}>
                Forty-five minutes, and we do not talk about AI.
              </h2>
              <p className="lede mt-6 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
                We ask what your week looks like, which task makes you sigh, how long it takes and what
                happens when it goes wrong. You get a written read on what is worth automating and what
                is not. No obligation, and no slide deck.
              </p>
              <Link className="btn btn--accent mt-9" href="/contact/">
                Book the conversation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
