import type { Metadata } from "next";
import Link from "next/link";
import { Stage } from "@/components/stage";

export const metadata: Metadata = {
  title: "Nothing here",
  robots: { index: false, follow: true },
};

const ELSEWHERE: [string, string][] = [
  ["/events/", "What is coming up"],
  ["/join/", "How to join"],
  ["/about/", "Who we are"],
  ["/contact/", "Talk to us"],
];

export default function NotFound() {
  return (
    <Stage className="stage--doc">
      <p className="eyebrow eyebrow--accent rise">Error 404</p>
      <h1 className="display-1 rise mt-4 max-w-[14ch] [animation-delay:80ms]">
        This page is not where you left it.
      </h1>
      <p className="lede rise mt-5 max-w-measure [animation-delay:160ms]">
        Either we moved it, or the link was wrong. Both happen.
      </p>

      <ul className="rows rise mt-10 max-w-[32rem] [animation-delay:240ms]">
        {ELSEWHERE.map(([href, label]) => (
          <li key={href}>
            <Link
              className="group flex items-center justify-between gap-4 py-4 text-ink transition-colors hover:text-brand"
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
    </Stage>
  );
}
