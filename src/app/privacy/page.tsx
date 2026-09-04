import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: true },
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
            <strong>Your email address</strong>, because you cannot have an account without one. We
            add it by hand when you join.
          </li>
          <li>
            <strong>Your first name and surname</strong>, so contest results can name a winner.
          </li>
          <li>
            <strong>Your GitHub username</strong>, only if you choose to add it.
          </li>
          <li>
            <strong>Your progress in each session</strong>, meaning which checklist items you ticked.
            Only you and the two organisers can see it.
          </li>
          <li>
            <strong>Your contest submissions</strong>, meaning a title, a live URL, a repository URL
            and your own written note.
          </li>
        </ul>
        <p>
          We do not use analytics, tracking pixels, advertising cookies, or any third party
          measurement. The only cookie-equivalent storage on this site is the one that keeps you
          signed in.
        </p>

        <h2>Why</h2>
        <p>
          To run the club: give you access to session material, record what you finished, and judge
          contests fairly. Nothing else.
        </p>

        <h2>Where it lives</h2>
        <p>
          In a Supabase project hosted in the European Union. The site itself is served by Cloudflare
          as static files and holds no database of its own.
        </p>

        <h2>Who sees what</h2>
        <p>
          The two organisers of the association can see every account, submission and score. Other
          members can see the name and project of contest winners once results are published, and
          nothing else about you. Session material is only visible to signed-in members, and locked
          sessions are not merely hidden in the page, they are refused by the database.
        </p>

        <h2>Published results</h2>
        <p>
          Contest results are published on this site with your first name and surname. You are asked
          for written consent when you join. You can compete without being named: tell an organiser
          and results will show your first name and initial instead.
        </p>

        <h2>How long</h2>
        <p>
          For as long as you are a member, and for one academic year afterwards so that a portfolio
          link keeps working. Ask and we delete your account sooner.
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
            <strong>Contact address to be published before the first session.</strong> Until then,
            reach the association through the student group.
          </p>
        )}
      </div>
    </PageShell>
  );
}
