import Link from "next/link";
import { href, t, type Locale } from "@/lib/i18n";

/**
 * L'appel final, sur marine : deux phrases du plan et les deux actions.
 * Il ferme l'accueil et les pages intérieures.
 */
export function CtaBand({ lang }: { lang: Locale }) {
  const d = t(lang);

  return (
    <section className="cta on-navy" aria-labelledby="cta-title">
      <div className="container cta__in">
        <h2 className="display-1" id="cta-title" data-reveal>
          {d.cta.title}
        </h2>
        <div data-reveal>
          <p className="lede">{d.cta.body}</p>
          <div className="cta__actions">
            <Link className="btn btn--brand" href={href("programme", lang)}>
              {d.hero.ctaPrimary}
            </Link>
            <Link className="btn btn--ghost" href={href("join", lang)}>
              {d.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
