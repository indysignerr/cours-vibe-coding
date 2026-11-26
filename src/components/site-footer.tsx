import Link from "next/link";
import { BrandMark, BrandWordmark } from "@/components/brand";
import { LangSwitch } from "@/components/lang-switch";
import { EN_ONLY, href, t, type Locale, type PageRef, type RouteKey } from "@/lib/i18n";
import { SITE } from "@/lib/site";

/**
 * Le pied de page, sur marine.
 *
 * L'adresse email n'est montrée qu'une fois son routage actif
 * (content/site.json → email.active) : un lien mailto vers une boîte qui
 * ne reçoit rien serait un piège pour celui qui écrit.
 */
const EXPLORE: RouteKey[] = ["about", "programme", "team", "join", "faq"];

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
    <footer className="footer on-navy">
      <div className="container">
        <div className="footer__in">
          <div className="footer__brand">
            {/* Le logo entier. Le nom est aussi écrit, pour qui ne voit pas le dessin. */}
            <p className="footer__logo">
              <BrandMark className="footer__mark" />
              <BrandWordmark className="footer__name" />
              <span className="sr-only">{SITE.name}</span>
            </p>
            <p className="footer__about">{d.footer.about}</p>
            <LangSwitch lang={lang} page={page} />
          </div>

          <nav className="footer__col" aria-label={d.footer.explore}>
            <p className="eyebrow">{d.footer.explore}</p>
            <ul>
              {EXPLORE.map((key) => (
                <li key={key}>
                  <Link href={href(key, lang)}>{d.nav[key]}</Link>
                </li>
              ))}
              <li>
                <a href={EN_ONLY.setup}>
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
                <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer">
                  {d.footer.linkedin}
                </a>
              </li>
              {/* L'adresse n'apparaît qu'une fois son routage en place
                  (content/site.json → email.active). */}
              {SITE.emailActive ? (
                <li>
                  <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
                </li>
              ) : null}
              <li>
                <a href={SITE.url}>{SITE.domain}</a>
              </li>
            </ul>
          </div>

          <nav className="footer__col" aria-label={d.footer.legalTitle}>
            <p className="eyebrow">{d.footer.legalTitle}</p>
            <ul>
              <li>
                <a href={EN_ONLY.legal}>
                  {d.footer.legal}
                  {english}
                </a>
              </li>
              <li>
                <a href={EN_ONLY.privacy}>
                  {d.footer.privacy}
                  {english}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="footer__legal">{SITE.legalMention}</p>
      </div>
    </footer>
  );
}
