import type { Metadata, Viewport } from "next";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { body, display, mono } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.name}` },
  description:
    "We automate the repetitive work inside your company with AI, and we hand you the compliance file that lets you deploy it. A student-run association at Albert School Milano.",
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.tagline }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: { index: true, follow: true },
};

// Schéma Organization, identique sur toutes les pages.
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: SITE.url,
  logo: `${SITE.url}/android-chrome-512x512.png`,
  description:
    "A student-run association that automates repetitive work inside companies and delivers the compliance file that lets them deploy it.",
  email: SITE.contactEmail || undefined,
  knowsLanguage: ["en", "it", "fr"],
  founder: SITE.founders.map((name) => ({ "@type": "Person", name })),
  parentOrganization: { "@type": "EducationalOrganization", name: SITE.school },
  address: { "@type": "PostalAddress", addressLocality: SITE.campus, addressCountry: "IT" },
  areaServed: "EU",
};

export const viewport: Viewport = {
  themeColor: "#0e1a2b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-3 focus:text-on-ink"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
