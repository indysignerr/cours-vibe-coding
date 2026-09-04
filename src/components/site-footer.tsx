import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-stage px-6 py-14 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-8 border-t border-line pt-10">
        <div>
          <p className="font-display text-2xl">{SITE.name}</p>
          <p className="mt-2 max-w-measure text-sm text-muted">{SITE.legalMention}</p>
        </div>
        <nav aria-label="Secondary" className="flex flex-wrap gap-x-6 text-sm">
          <a className="tap flex items-center hover:text-accent-strong" href="/programme/">
            Programme
          </a>
          <a className="tap flex items-center hover:text-accent-strong" href="/contests/">
            Contests
          </a>
          <a className="tap flex items-center hover:text-accent-strong" href="/setup/">
            Setup
          </a>
          <a className="tap flex items-center hover:text-accent-strong" href="/submit/">
            Submit
          </a>
          <a className="tap flex items-center hover:text-accent-strong" href="/legal/">
            Legal notice
          </a>
          <a className="tap flex items-center hover:text-accent-strong" href="/privacy/">
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}
