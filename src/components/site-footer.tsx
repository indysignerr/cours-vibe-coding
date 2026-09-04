import { Mascot } from "@/components/mascot";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/site";

const LINKS = [
  ["/programme/", "Path"],
  ["/contests/", "Contests"],
  ["/setup/", "Setup"],
  ["/submit/", "Submit"],
  ["/leaderboard/", "Board"],
  ["/legal/", "Legal notice"],
  ["/privacy/", "Privacy"],
] as const;

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-stage px-5 py-14 md:px-10">
      <div className="card-3d flex flex-wrap items-end justify-between gap-8 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <Mascot size={56} mood="happy" />
          <div>
            <p className="font-display text-2xl font-extrabold">{SITE.name}</p>
            <p className="mt-1 max-w-measure text-sm text-muted">{SITE.legalMention}</p>
          </div>
        </div>
        <nav aria-label="Secondary" className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
          <ThemeToggle />
          {LINKS.map(([href, label]) => (
            <a
              key={href}
              className="tap flex items-center rounded-full px-3 font-bold text-muted hover:bg-sunken hover:text-ink"
              href={href}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
