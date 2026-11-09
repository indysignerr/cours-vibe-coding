import type { Metadata } from "next";
import { PageFrame } from "@/components/page-frame";
import { PageHead } from "@/components/page-head";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal notice",
  alternates: { canonical: "/legal/" },
  description:
    "Legal notice for albertlight.com: publisher, hosting, intellectual property and applicable law.",
};

// « A, B and C » : une liste, pas des « and » en chaîne.
const FOUNDERS = new Intl.ListFormat("en-GB", { type: "conjunction" }).format(SITE.founders);

export default function LegalPage() {
  return (
    <PageFrame lang="en" page={null}>
      <PageHead eyebrow="Legal" title="Legal notice" />
      <div className="container doc">
        <div className="prose">
          <h2>Publisher</h2>
          <p>
            This site is published by {SITE.name}. {SITE.legalMention} It is run
            by {FOUNDERS}, students at {SITE.school}, and is
            not a service of the school. Opinions and content here are those of
            the association, not of {SITE.school}.
          </p>
          {SITE.emailActive ? (
            <p>
              Contact: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </p>
          ) : (
            // Tant que le routage n'est pas en place (content/site.json →
            // email.active), l'adresse est montrée sans être un lien.
            <p>
              <strong>The contact address, {SITE.contactEmail}, is not live yet.</strong> Until
              it is, reach the association through any of its members.
            </p>
          )}

          <h2>Hosting</h2>
          <p>
            Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, United
            States.{" "}
            <a
              href="https://www.cloudflare.com"
              rel="noreferrer noopener"
              target="_blank"
            >
              cloudflare.com
            </a>
          </p>
          <p>
            The database and authentication are provided by Supabase, hosted in
            the European Union.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Material written by the association for its events — briefs, workshop
            notes, slides — may be reused by participants for their own learning.
            It may not be resold or republished as a commercial training product.
          </p>
          <p>
            What you build at one of our events is yours. We ask separately, each
            time, before showing a project, a name or a URL anywhere.
          </p>

          <h2>Trademarks</h2>
          <p>
            Claude and Claude Code are trademarks of Anthropic. GitHub is a
            trademark of GitHub, Inc. Cloudflare is a trademark of Cloudflare,
            Inc. Supabase is a trademark of Supabase, Inc. This association is not
            affiliated with, endorsed by, or sponsored by any of them.
          </p>

          <h2>Applicable law</h2>
          <p>
            This site is governed by French law. Any dispute falls to the
            competent French courts.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
