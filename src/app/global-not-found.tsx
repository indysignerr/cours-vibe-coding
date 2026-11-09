import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { body, mono } from "@/lib/fonts";
import { href } from "@/lib/i18n";
import "./globals.css";

/**
 * La page 404, pour tout le site.
 *
 * Il y a trois layouts racine (un par langue) : aucun n'est « le » layout
 * d'où composer une 404 commune. Next la rend donc à part, sans layout —
 * d'où le <html> et les imports de style ici.
 */
export const metadata: Metadata = {
  title: "Nothing here — Albert L.I.G.H.T.",
  description: "This page does not exist, or it moved.",
  robots: { index: false, follow: true },
};

const ELSEWHERE: [string, string][] = [
  [href("home", "en"), "Home"],
  [href("programme", "en"), "The programme"],
  [href("join", "en"), "How to join"],
  [href("team", "en"), "The team"],
];

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${body.variable} ${mono.variable}`}>
      <body>
        <SiteHeader lang="en" page={null} />
        <main id="main" className="lost">
          <div className="container">
            <p className="eyebrow eyebrow--accent">Error 404</p>
            <h1 className="display-1">The light is on, but nobody is home.</h1>
            <p className="lede">Either we moved this page, or the link was wrong. Both happen.</p>
            <ul className="rows lost__links">
              {ELSEWHERE.map(([to, label]) => (
                <li key={to}>
                  <a className="also__link" href={to}>
                    <span>{label}</span>
                    <span aria-hidden>→</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </main>
        <SiteFooter lang="en" page={null} />
      </body>
    </html>
  );
}
