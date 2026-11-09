import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Stage } from "@/components/stage";
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

/**
 * Le contact : un écran, le formulaire à droite, tout le reste à gauche.
 */
export default function ContactPage() {
  return (
    <Stage className="stage--contact">
      <div className="desk">
        <div className="desk__left">
          <p className="eyebrow eyebrow--accent rise">Contact</p>
          <h1 className="display-1 rise mt-4 [animation-delay:80ms]">
            Talk to us.
          </h1>
          <p className="lede rise mt-5 max-w-[34ch] [animation-delay:160ms]">
            Students, partners, and anyone who would like to speak at an
            event.
          </p>

          <ul className="rise mt-7 flex flex-wrap gap-x-7 gap-y-2 [animation-delay:240ms]">
            <li>
              <a
                className="underline-grow text-ink"
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a className="underline-grow text-ink" href={`mailto:${SITE.contactEmail}`}>
                {SITE.contactEmail}
              </a>
            </li>
          </ul>

          <section className="rise mt-auto pt-10 [animation-delay:320ms]">
            <p className="eyebrow">For partners · what you get</p>
            <ul className="rows mt-3 max-w-[34rem]">
              {PARTNER_GETS.map((line) => (
                <li key={line} className="py-2.5 text-body">
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-3 max-w-[34rem] text-sm text-muted">
              What we ask for: prizes, credits, a speaker or food, before any
              money.
            </p>
          </section>
        </div>

        <div className="desk__form rise [animation-delay:200ms]">
          <p className="eyebrow">Send a message</p>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </div>
    </Stage>
  );
}
