import type { Metadata } from "next";
import Link from "next/link";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal } from "@/components/motion/reveal";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a first conversation. Forty-five minutes, no slide deck, and a written read on what is worth automating in your company and what is not.",
  openGraph: { images: [{ url: "/og/contact.png", width: 1200, height: 630, alt: "Forty-five minutes. No slide deck" }] },
};

const AGENDA: [string, string][] = [
  ["What your week looks like", "Not your strategy. The hours, and where they go."],
  ["Which task makes you sigh", "Frequency, duration, and who does it when that person is away."],
  [
    "What happens when it goes wrong",
    "The cost of an error is what decides whether a human stays in the loop.",
  ],
  [
    "Who would have to agree",
    "Works council, union representatives, a client who audits you, your own counsel.",
  ],
];

/** Gabarit à copier : un premier message utile tient en six lignes. */
const BRIEF = `Company:
Size and sector:
The task we would like to stop doing by hand:
How often it happens, and how long it takes:
What the data involved is (customer, staff, financial, none of these):
Who would have to approve a change like this:`;

export default function ContactPage() {
  const email = SITE.contactEmail;
  const whatsapp = SITE.whatsapp;
  const booking = SITE.bookingUrl;
  const mailto = email
    ? `mailto:${email}?subject=${encodeURIComponent("First conversation")}&body=${encodeURIComponent(BRIEF)}`
    : null;

  return (
    <PageShell
      eyebrow="Contact"
      title="Forty-five minutes, and we do not talk about AI."
      lede="You leave with a written read on what is worth automating in your company and what is not. Nothing is installed, nothing is signed, and there is no slide deck."
    >
      {/* Le créneau, s'il existe : c'est le chemin le plus court */}
      {booking ? (
        <Reveal as="section" className="card card--ink mb-16 px-7 py-12 md:px-14 md:py-16" y={26}>
          <p className="eyebrow eyebrow--on-ink">Pick a slot</p>
          <h2 className="display-2 mt-4 max-w-[20ch]" style={{ color: "var(--on-ink)" }}>
            Choose a time in our calendar.
          </h2>
          <p className="lede mt-5 max-w-measure" style={{ color: "var(--on-ink-muted)" }}>
            The slots you see are the ones that are genuinely free. You get the invitation
            immediately, with a video link if you are not in {SITE.campus}.
          </p>
          <Magnetic>
            <a className="btn btn--brand mt-8" href={booking} target="_blank" rel="noopener noreferrer">
              Open the booking calendar
            </a>
          </Magnetic>
        </Reveal>
      ) : null}

      <div className="grid gap-14 md:grid-cols-12">
        <Reveal as="section" className="md:col-span-5" y={24}>
          <p className="eyebrow">How to reach us</p>

          {mailto ? (
            <>
              <Magnetic>
                <a className="btn btn--primary mt-6 w-full sm:w-auto" href={mailto}>
                  Write to us
                </a>
              </Magnetic>
              <p className="mt-4 text-sm text-muted">
                The link opens a message already structured. If you would rather write your own:{" "}
                <a className="text-accent underline underline-offset-4" href={`mailto:${email}`}>
                  {email}
                </a>
              </p>
            </>
          ) : (
            <div className="card card--sand mt-6 p-6">
              <p className="text-body">
                Our contact address is being set up and will be published here before the first
                engagement. Until then, reach us through {SITE.school} {SITE.campus} or through any
                member of the team.
              </p>
            </div>
          )}

          {whatsapp ? (
            <a className="btn btn--ghost mt-4 w-full sm:w-auto" href={whatsapp}>
              Message us on WhatsApp
            </a>
          ) : null}

          {!booking ? (
            <div className="card card--sand mt-6 p-6">
              <p className="eyebrow">Booking calendar</p>
              <p className="mt-3 text-body">
                We are setting up an appointment page so you can pick a slot yourself. Until it is
                live, propose two or three times in your message and we will confirm one.
              </p>
              <p className="mt-4 text-sm text-muted">
                For the organisers: create a Google Calendar appointment schedule, then paste its
                public link into <code className="rounded bg-canvas px-1.5 py-0.5">bookingUrl</code>{" "}
                in <code className="rounded bg-canvas px-1.5 py-0.5">src/lib/site.ts</code>.
              </p>
            </div>
          ) : null}

          <h2 className="eyebrow mt-12">Where we are</h2>
          <p className="mt-3 text-body">
            {SITE.school}, {SITE.campus}. We work with Italian companies in person and with the rest
            of Europe remotely.
          </p>

          <h2 className="eyebrow mt-10">Working language</h2>
          <p className="mt-3 text-body">
            English or Italian for meetings and deliverables. French on request.
          </p>

          <h2 className="eyebrow mt-10">Not a company?</h2>
          <p className="mt-3 text-body">
            If you are a student at {SITE.school}, the association is the door, not this page.
          </p>
          <Link className="btn btn--quiet underline-grow mt-3 -ml-2" href="/join/">
            Join the association
          </Link>
        </Reveal>

        <Reveal as="section" className="md:col-span-6 md:col-start-7" y={24} delay={0.08}>
          <p className="eyebrow">What a useful first message contains</p>
          <p className="mt-4 text-body">
            Six lines are enough. Copy this, fill it in, and we will come back with a view rather than
            a request for a call to arrange a call.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-card bg-sunken p-6 text-sm leading-relaxed text-body shadow-hair">
            {BRIEF}
          </pre>

          <h2 className="eyebrow mt-12">What we ask in the meeting</h2>
          <Reveal as="dl" className="rows mt-6" stagger y={16}>
            {AGENDA.map(([term, detail]) => (
              <div key={term} className="grid gap-2 py-5 md:grid-cols-12 md:gap-6">
                <dt className="display-3 md:col-span-5">{term}</dt>
                <dd className="text-body md:col-span-7">{detail}</dd>
              </div>
            ))}
          </Reveal>

          <p className="mt-10 max-w-measure text-sm text-muted">
            We refuse engagements that decide about a person — CV screening, employee scoring, credit,
            health. If that is what you need, we will say so in this first meeting rather than three
            months later.
          </p>
        </Reveal>
      </div>
    </PageShell>
  );
}
