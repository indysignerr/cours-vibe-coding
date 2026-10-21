import Link from "next/link";
import { Logo } from "@/components/brand";
import { SITE } from "@/lib/site";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Work with us",
    links: [
      ["/solutions/", "Solutions"],
      ["/approach/", "Approach"],
      ["/contact/", "Contact"],
    ],
  },
  {
    title: "The association",
    links: [
      ["/about/", "Who we are"],
      ["/join/", "Join us"],
      ["/events/", "Events"],
    ],
  },
  {
    title: "Members",
    links: [
      ["/signup/", "Create an account"],
      ["/programme/", "The path"],
      ["/sessions/", "Sessions"],
      ["/contests/", "Contests"],
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
    <footer className="mt-24 border-t border-line bg-ink-surface">
      <div className="mx-auto max-w-stage px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo compact onInk />
            <p className="mt-5 max-w-[34ch] text-sm text-on-ink-muted">{SITE.legalMention}</p>
            {SITE.contactEmail ? (
              <a
                className="mt-5 inline-block text-sm text-brand-soft underline underline-offset-4"
                href={`mailto:${SITE.contactEmail}`}
              >
                {SITE.contactEmail}
              </a>
            ) : null}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-8 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="eyebrow eyebrow--on-ink">{col.title}</p>
                <ul className="mt-4 grid gap-2.5">
                  {col.links.map(([href, label]) => (
                    <li key={href}>
                      <Link
                        className="text-sm text-on-ink/85 transition-colors hover:text-brand-soft"
                        href={href}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <p className="mt-14 border-t border-on-ink/15 pt-6 text-xs text-on-ink-muted">
          {SITE.name} · {SITE.school} {SITE.campus}
        </p>
      </div>
    </footer>
  );
}
