import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHead, Shell } from "@/components/shell";
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

/** Ce qu'un partenaire obtient, dans les mots du plan. */
const PARTNER_GETS = [
  "Their logo on the event and its posts",
  "A five-minute talk slot",
  "The chance to set a tournament challenge",
  "First access to motivated tech students for internships and junior roles",
];

export default function ContactPage() {
  return (
    <Shell>
      <PageHead
        eyebrow="Contact"
        title="Talk to us."
        lede="Students, partners, and anyone who would like to speak at an event."
      />

      <section className="max-w-xl">
        <h2>Send a message</h2>
        <div className="mt-5">
          <ContactForm />
        </div>
      </section>

      <section className="mt-12">
        <h2>Elsewhere</h2>
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
          <li>
            <a
              className="text-ink underline underline-offset-4"
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a className="text-ink underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
              {SITE.contactEmail}
            </a>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2>For partners</h2>
        <p className="mt-3 text-muted">What a partner gets:</p>
        <ul className="rows mt-2 max-w-[60ch]">
          {PARTNER_GETS.map((line) => (
            <li key={line} className="py-2.5">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-4 max-w-[60ch] text-sm text-muted">
          What we ask for: prizes, credits, a speaker or food, before any money.
        </p>
      </section>
    </Shell>
  );
}
