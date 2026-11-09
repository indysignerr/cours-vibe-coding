import {
  LOCALES,
  LOCALE_NAMES,
  href,
  pagePath,
  t,
  type Locale,
  type PageRef,
} from "@/lib/i18n";

/**
 * Le sélecteur de langue : des liens, pas un menu à script.
 *
 * Chaque lien mène à la MÊME page dans l'autre langue. Ce sont de vrais
 * <a> — changer de langue change de document (`<html lang>` change), et
 * un lien fonctionne sans JavaScript, au clic du milieu, pour un robot.
 * L'anglais vient en premier : c'est la langue d'arrivée du site.
 *
 * Deux formes. Dans le pied de page, la liste des quatre codes. Dans
 * l'en-tête (`compact`), la même liste sur grand écran, et sous 1100 px
 * un <details> qui ne montre que la langue courante et se déplie : quatre
 * codes ne tiennent pas dans la barre d'un téléphone. C'est la feuille
 * de style qui choisit laquelle des deux est affichée ; l'autre est en
 * `display: none`, donc absente aussi pour un lecteur d'écran.
 */
export function LangSwitch({
  lang,
  page,
  compact = false,
}: {
  lang: Locale;
  page: PageRef | null;
  compact?: boolean;
}) {
  const d = t(lang);
  const to = (l: Locale) => (page ? pagePath(page, l) : href("home", l));

  const list = (
    <ul className="lang" aria-label={d.nav.language}>
      {LOCALES.map((l) => (
        <li key={l}>
          <a
            className="lang__link"
            href={to(l)}
            hrefLang={l}
            lang={l}
            aria-current={l === lang ? "true" : undefined}
            title={LOCALE_NAMES[l]}
          >
            {l.toUpperCase()}
          </a>
        </li>
      ))}
    </ul>
  );
  if (!compact) return list;

  return (
    <>
      {list}
      {/* `name` : ouvrir ce panneau referme celui du menu, et inversement. */}
      <details className="lang-menu" name="header-panel">
        <summary className="lang-menu__btn" aria-label={`${d.nav.language}: ${LOCALE_NAMES[lang]}`}>
          <span aria-hidden>{lang.toUpperCase()}</span>
          <span aria-hidden className="lang-menu__caret" />
        </summary>
        <ul className="lang-menu__panel">
          {LOCALES.map((l) => (
            <li key={l}>
              <a
                className="lang-menu__link"
                href={to(l)}
                hrefLang={l}
                lang={l}
                aria-current={l === lang ? "true" : undefined}
              >
                {LOCALE_NAMES[l]}
                <span aria-hidden className="lang-menu__code">
                  {l.toUpperCase()}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
