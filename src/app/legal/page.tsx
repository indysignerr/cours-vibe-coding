import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal notice",
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <PageShell eyebrow="Legal" title="Legal notice">
      <div className="prose">
        <h2>Publisher</h2>
        <p>
          This site is published by {SITE.name}, {SITE.legalMention.toLowerCase()} The association is
          run by students and is not a service of the school. Opinions and content here are those of
          the association, not of {SITE.school}.
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

        <h2>Hosting</h2>
        <p>
          Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, United States.{" "}
          <a href="https://www.cloudflare.com" rel="noreferrer noopener" target="_blank">
            cloudflare.com
          </a>
        </p>
        <p>
          The database and authentication are provided by Supabase, hosted in the European Union.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Course material on this site is written by the association and may be reused by its members
          for their own learning. It may not be resold or republished as a commercial training
          product.
        </p>
        <p>
          Projects submitted to contests remain the property of the students who built them. By
          submitting, you allow the association to show your project name, your name and your public
          URL on this site and in the student group.
        </p>

        <h2>Trademarks</h2>
        <p>
          Claude and Claude Code are trademarks of Anthropic. GitHub is a trademark of GitHub, Inc.
          Cloudflare is a trademark of Cloudflare, Inc. Supabase is a trademark of Supabase, Inc.
          This association is not affiliated with, endorsed by, or sponsored by any of them.
        </p>

        <h2>Applicable law</h2>
        <p>
          This site is governed by French law. Any dispute falls to the competent French courts.
        </p>
      </div>
    </PageShell>
  );
}
