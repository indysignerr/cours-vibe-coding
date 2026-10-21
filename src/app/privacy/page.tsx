import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What we store, and what we never do with it."
      lede="Short version: your name, your email, and the projects you submit. Nothing is sold, nothing is used for advertising, and nothing leaves the European Union."
    >
      <div className="prose">
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>An event sign-up</strong>: your name, your email, the company you give if you give
            one, and the optional note you write. You do not need an account for this.
          </li>
          <li>
            <strong>An organiser account</strong>, for the handful of people who hold the sign-up
            lists: an email address and a password we never see.
          </li>
        </ul>
        <p>
          We do not use analytics, tracking pixels, advertising cookies, or any third party
          measurement. The only cookie-equivalent storage on this site is the one that keeps an
          organiser signed in.
        </p>

        <h2>Why</h2>
        <p>
          To know how many people are coming, so we put out the right number of chairs and order the
          right amount of food. To write to you if a date, a room or a time changes. Nothing else.
        </p>

        <h2>Where it lives</h2>
        <p>
          In a database hosted in the European Union by Supabase, which acts as our processor. The
          site itself is served by Cloudflare. Neither is given the list for any purpose of their own.
        </p>

        <h2>Who sees what</h2>
        <p>
          Only the organisers. The list is never published, never shown on this site, and never passed
          to a company — including a company sponsoring an event.
        </p>

        <h2>How long</h2>
        <p>
          A sign-up is deleted one month after the event it was for. It is never merged into anything
          else.
        </p>

        <h2>Your rights</h2>
        <p>
          Under the GDPR you can ask to see, correct, export or delete your data, and you can object
          to your name being published. Ask an organiser. If you are not satisfied you can complain
          to the CNIL, the French data protection authority, at{" "}
          <a href="https://www.cnil.fr" rel="noreferrer noopener" target="_blank">
            cnil.fr
          </a>
          .
        </p>

        {SITE.contactEmail ? (
          <p>
            Contact: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
          </p>
        ) : (
          <p>
            <strong>Contact address to be published before the first event.</strong> Until then,
            reach the association through any of its members.
          </p>
        )}
      </div>
    </PageShell>
  );
}
