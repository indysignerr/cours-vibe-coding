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
 * Le sélecteur de langue : trois liens, pas un menu.
 *
 * Chaque lien mène à la MÊME page dans l'autre langue. Ce sont de vrais
 * <a> — changer de langue change de document (`<html lang>` change), et
 * un lien fonctionne sans JavaScript, au clic du milieu, pour un robot.
 */
export function LangSwitch({
  lang,
  page,
}: {
  lang: Locale;
  page: PageRef | null;
}) {
  return (
    <ul className="lang" aria-label={t(lang).nav.language}>
      {LOCALES.map((l) => (
        <li key={l}>
          <a
            className="lang__link"
            href={page ? pagePath(page, l) : href("home", l)}
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
}
