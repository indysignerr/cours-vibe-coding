import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/programme/", label: "Programme" },
  { href: "/contests/", label: "Contests" },
  { href: "/setup/", label: "Setup" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-stage items-center justify-between px-6 py-6 md:px-10">
      <a
        className="tap flex items-center whitespace-nowrap font-display text-xl leading-none hover:text-accent-strong sm:text-2xl"
        href="/"
      >
        {SITE.name}
      </a>
      <nav aria-label="Main" className="flex items-center gap-1 text-sm">
        {LINKS.map((l) => (
          <a
            key={l.href}
            className="tap hidden items-center px-3 font-medium hover:text-accent-strong sm:flex"
            href={l.href}
          >
            {l.label}
          </a>
        ))}
        <a
          className="tap ml-2 flex items-center whitespace-nowrap rounded-full bg-ink px-5 font-medium text-paper transition-colors duration-200 ease-swift hover:bg-accent hover:text-accent-ink"
          href="/sessions/"
        >
          Sign in
        </a>
      </nav>
    </header>
  );
}
