import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { LangSwitch } from "@/components/lang-switch";
import { EN_ONLY, href, t, type Locale, type PageRef } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Le pied de page.
 *
 * L'adresse email est un texte tant que le routage n'est pas actif
 * (content/site.json → email.active) : un lien mailto vers une boîte qui
 * ne reçoit rien serait un piège pour celui qui écrit.
 */
export function SiteFooter({
  lang,
  page,
}: {
  lang: Locale;
  page: PageRef | null;
}) {
  const d = t(lang);
  const english = lang === "en" ? "" : ` (${d.join.beforeNote})`;

  return (
    <footer className="footer">
      <div className="footer__in">
        <div className="footer__brand">
          <BrandMark className="footer__mark" />
          <p className="footer__name">{SITE.name}</p>
          <p className="footer__about">{d.footer.about}</p>
          <LangSwitch lang={lang} page={page} />
        </div>

        <nav className="footer__col" aria-label={d.footer.explore}>
          <p className="eyebrow">{d.footer.explore}</p>
          <ul>
            <li>
              <Link className="link" href={href("programme", lang)}>
                {d.nav.programme}
              </Link>
            </li>
            <li>
              <Link className="link" href={href("team", lang)}>
                {d.nav.team}
              </Link>
            </li>
            <li>
              <Link className="link" href={href("join", lang)}>
                {d.nav.join}
              </Link>
            </li>
            <li>
              <a className="link" href={EN_ONLY.setup}>
                {d.footer.beforeYouCome}
                {english}
              </a>
            </li>
          </ul>
        </nav>

        <div className="footer__col">
          <p className="eyebrow">{d.footer.contact}</p>
          <ul>
            <li>
              <a className="link" href={SITE.url}>
                {SITE.domain}
              </a>
            </li>
            <li>
              <a
                className="link"
                href={SITE.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {d.footer.linkedin}
              </a>
            </li>
            <li>
              {SITE.emailActive ? (
                <a className="link" href={`mailto:${SITE.contactEmail}`}>
                  {SITE.contactEmail}
                </a>
              ) : (
                <span className="footer__soon">
                  {SITE.contactEmail}
                  <span className="badge badge--past">{d.footer.emailSoon}</span>
                </span>
              )}
            </li>
          </ul>
        </div>

        <nav className="footer__col" aria-label={d.footer.legalTitle}>
          <p className="eyebrow">{d.footer.legalTitle}</p>
          <ul>
            <li>
              <a className="link" href={EN_ONLY.legal}>
                {d.footer.legal}
                {english}
              </a>
            </li>
            <li>
              <a className="link" href={EN_ONLY.privacy}>
                {d.footer.privacy}
                {english}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <p className="footer__legal">{SITE.legalMention}</p>
    </footer>
  );
}
