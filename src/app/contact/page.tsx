import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with Albert L.I.G.H.T. at ${SITE.school} ${SITE.campus} — students, partners and anyone who wants to speak at an event.`,
  openGraph: {
    images: [
      { url: "/og/contact.png", width: 1200, height: 630, alt: "Contact" },
    ],
  },
};

/**
 * La page de contact.
 *
 * Elle vendait un rendez-vous de quarante-cinq minutes sur
 * l'automatisation en entreprise — un reste de l'offre de conseil qui
 * n'existe plus. Ce qui reste vient du plan : ce qu'un partenaire
 * obtient, et ce qu'on lui demande.
 */
const PARTNER_GETS = [
  "Their logo on the event and its posts",
  "A five-minute talk slot",
  "The chance to set a tournament challenge",
  "First access to motivated tech students for internships and junior roles",
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Talk to us."
      lede="Students, partners, and anyone who would like to speak at an event."
    >
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-6 scroll-in">
          <p className="eyebrow">Send a message</p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 scroll-in">
          <p className="eyebrow">Elsewhere</p>
          <ul className="rows mt-6">
            <li className="py-4">
              <a
                className="underline-grow text-ink"
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li className="py-4">
              <a
                className="underline-grow text-ink"
                href={`mailto:${SITE.contactEmail}`}
              >
                {SITE.contactEmail}
              </a>
            </li>
          </ul>

          <p className="mt-10 max-w-measure text-sm text-muted">
            We are at {SITE.school} {SITE.campus}, and the association is
            recognised by the school.
          </p>
        </div>
      </div>

      <section className="mt-24 grid gap-10 md:grid-cols-12 scroll-in">
        <div className="md:col-span-5">
          <p className="eyebrow eyebrow--accent">For partners</p>
          <h2 className="display-2 mt-4">What a partner gets.</h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <ul className="rows">
            {PARTNER_GETS.map((line) => (
              <li key={line} className="py-4 text-body">
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-7 max-w-measure text-sm text-muted">
            What we ask for: prizes, credits, a speaker or food, before any
            money.
          </p>
          <Link className="btn btn--ghost mt-8" href="/about/">
            Who we are
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
