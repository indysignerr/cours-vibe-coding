import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { SITE } from "@/lib/site";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Work with us",
    links: [
      ["/services/", "Services"],
      ["/approach/", "Approach"],
      ["/contact/", "Contact"],
    ],
  },
  {
    title: "The association",
    links: [
      ["/team/", "Team"],
      ["/join/", "Join us"],
      ["/programme/", "The path"],
    ],
  },
  {
    title: "Members",
    links: [
      ["/sessions/", "Sessions"],
      ["/contests/", "Contests"],
      ["/leaderboard/", "Board"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/legal/", "Legal notice"],
      ["/privacy/", "Privacy"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="mx-auto max-w-stage px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Wordmark compact />
            <p className="mt-4 max-w-[34ch] text-sm text-muted">{SITE.legalMention}</p>
            {SITE.contactEmail ? (
              <a className="mt-4 inline-block text-sm text-accent underline underline-offset-4" href={`mailto:${SITE.contactEmail}`}>
                {SITE.contactEmail}
              </a>
            ) : null}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow">{col.title}</p>
                <ul className="mt-3 grid gap-2">
                  {col.links.map(([href, label]) => (
                    <li key={href}>
                      <Link className="text-sm text-body transition-colors hover:text-ink" href={href}>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-12 border-t border-line pt-6 text-xs text-muted">
          {SITE.name} · {SITE.school} {SITE.campus}
        </p>
      </div>
    </footer>
  );
}
