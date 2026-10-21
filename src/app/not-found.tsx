import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Nothing here",
  robots: { index: false, follow: true },
};

const ELSEWHERE: [string, string][] = [
  ["/solutions/", "The five engagements"],
  ["/events/", "What is coming up"],
  ["/about/", "Who we are"],
  ["/contact/", "Book a conversation"],
];

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="relative overflow-hidden">
        <div className="mx-auto max-w-stage px-5 py-32 md:px-8 md:py-44">
          <BrandMark
            className="pointer-events-none absolute -right-20 top-10 size-[26rem] opacity-[0.05] md:right-10 md:size-[34rem]"
            outline="var(--ink)"
            glyph="var(--brand)"
          />
          <div className="relative md:pl-[8%]">
            <p className="eyebrow eyebrow--accent">Error 404</p>
            <h1 className="display-1 mt-6 max-w-[14ch]">This page is not where you left it.</h1>
            <p className="lede mt-8 max-w-measure">
              Either we moved it, or the link was wrong. Both happen.
            </p>
            <p className="mt-4 max-w-measure text-muted">
              If you followed a link from inside the site, that is our fault and we would like to
              know.
            </p>

            <ul className="rows mt-14 max-w-[36rem]">
              {ELSEWHERE.map(([href, label]) => (
                <li key={href}>
                  <Link
                    className="group flex items-center justify-between gap-4 py-5 text-ink transition-colors hover:text-brand"
                    href={href}
                  >
                    <span className="display-3 underline-grow">{label}</span>
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
