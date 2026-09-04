import { Mascot } from "@/components/mascot";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/programme/", label: "Path" },
  { href: "/contests/", label: "Contests" },
  { href: "/setup/", label: "Setup" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-stage items-center justify-between px-5 py-4 md:px-10 md:py-6">
      <a
        className="tap flex items-center gap-2 whitespace-nowrap font-display text-xl font-extrabold leading-none hover:text-accent-strong sm:text-2xl"
        href="/"
      >
        <Mascot size={34} />
        {SITE.name}
      </a>
      <nav aria-label="Main" className="flex items-center gap-1 text-sm">
        {LINKS.map((l) => (
          <a
            key={l.href}
            className="tap hidden items-center rounded-full px-4 font-bold text-muted hover:bg-sunken hover:text-ink sm:flex"
            href={l.href}
          >
            {l.label}
          </a>
        ))}
        <a className="btn-3d btn-3d--ink ml-2 min-h-[44px] px-5 text-sm" href="/sessions/">
          Sign in
        </a>
      </nav>
    </header>
  );
}
