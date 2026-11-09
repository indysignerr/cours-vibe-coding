import type { Metadata } from "next";
import Link from "next/link";
import { PageHead, Shell } from "@/components/shell";

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
    <Shell>
      <PageHead
        eyebrow="Error 404"
        title="This page is not where you left it."
        lede="Either we moved it, or the link was wrong. Both happen."
      />
      <ul className="rows max-w-md">
        {ELSEWHERE.map(([href, label]) => (
          <li key={href}>
            <Link className="block py-3 text-ink underline underline-offset-4" href={href}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
