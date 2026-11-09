import type { Metadata, Viewport } from "next";
import { LightNote } from "@/components/motion/light-note";
import { MotionRoot } from "@/components/motion/motion-root";
import { body, mono } from "@/lib/fonts";
import { OG_LOCALE, t, type Locale } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import "@/app/globals.css";

/**
 * Le document, commun aux trois langues.
 *
 * Il y a un layout racine par langue — (en), fr, it — pour que
 * `<html lang>` soit juste dans le HTML servi, sans JavaScript. Chacun
 * ne fait qu'appeler ce composant avec sa langue.
 *
 * Le script en tête de <body> s'exécute avant la première peinture. Il
 * pose deux classes sur <html> :
 *
 *   — `motion` si le système ne demande pas moins de mouvement. Tous les
 *     états de départ des animations vivent sous cette classe : sans
 *     JavaScript, ou en mouvement réduit, rien n'est caché ;
 *   — `fine` en plus sur un grand écran à souris : c'est là, et là
 *     seulement, que la scène 3D, le curseur et le défilement lissé
 *     existent.
 *
 * Et un filet : si les animations n'ont pas pris la main au bout de
 * six secondes (réseau coupé, script en échec), `motion-fallback`
 * révèle tout. Une animation manquée vaut mieux qu'une page vide.
 */
const BOOT = `(function(){var d=document.documentElement,m=window.matchMedia;if(m('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('motion');if(m('(pointer: fine)').matches&&m('(min-width: 1024px)').matches)d.classList.add('fine');window.__motionNet=setTimeout(function(){d.classList.add('motion-fallback')},6000);})();`;

// Schéma Organization, identique sur toutes les pages.
const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: ["Albert LIGHT", "Albert Light", "Albert L.I.G.H.T"],
  url: SITE.url,
  logo: `${SITE.url}/android-chrome-512x512.png`,
  description:
    "A student association at Albert School Milano, recognised by the school: Lab of Intelligent, Generative, Hands-on Technology. Free events for students, at least every two weeks.",
  foundingDate: "2026",
  nonprofitStatus: "https://schema.org/NonprofitType",
  sameAs: Object.values(SITE.social),
  knowsLanguage: ["en", "it", "fr"],
  founder: SITE.founders.map((name) => ({ "@type": "Person", name })),
  parentOrganization: { "@type": "EducationalOrganization", name: SITE.school },
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.campus,
    addressCountry: "IT",
  },
  areaServed: "EU",
};

export const viewport: Viewport = { themeColor: "#0e1a2b" };

/** Les métadonnées communes à toutes les pages d'une langue. */
export function baseMetadata(lang: Locale): Metadata {
  const d = t(lang);
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: d.meta.home.title,
      template: `%s — ${SITE.name}`,
    },
    description: d.meta.home.description,
    ...(SITE.googleSiteVerification
      ? { verification: { google: SITE.googleSiteVerification } }
      : {}),
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: OG_LOCALE[lang],
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
}

export function RootShell({
  lang,
  children,
}: {
  lang: Locale;
  children: React.ReactNode;
}) {
  const d = t(lang);
  return (
    <html
      lang={lang}
      className={`${body.variable} ${mono.variable}`}
      // Le script ci-dessous ajoute des classes avant l'hydratation.
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
        />
        <a href="#main" className="skip">
          {d.nav.skip}
        </a>
        {children}
        {/* Hors des pages : le billet reste épinglé d'une page à l'autre. */}
        <LightNote
          labels={{
            messageTitle: d.egg.messageTitle,
            message: d.egg.message,
            signature: d.egg.signature,
            off: d.egg.off,
          }}
        />
        <MotionRoot />
      </body>
    </html>
  );
}
