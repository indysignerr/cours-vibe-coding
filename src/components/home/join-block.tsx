import Link from "next/link";
import { EN_ONLY, eventHref, href, t, type Locale } from "@/lib/i18n";
import { shortDate, upcoming } from "@/lib/events";

/**
 * Rejoindre : deux voies d'entrée, sur ivoire.
 *
 * Ce que le plan dit tient en trois faits : le formulaire d'inscription
 * porte une case « join Albert LIGHT », un QR code permet de rejoindre
 * sur place, et les débutants sont bienvenus. Rien d'autre n'est décidé,
 * donc rien d'autre n'est écrit.
 */
export function JoinBlock({
  lang,
  full = false,
}: {
  lang: Locale;
  /** La page Rejoindre montre tout ; l'accueil renvoie vers elle. */
  full?: boolean;
}) {
  const d = t(lang);
  const [next] = upcoming(lang);
  const Title = full ? "h2" : "h3";

  return (
    <section className="join on-light" aria-labelledby={full ? undefined : "join-title"}>
      <span className="wire" data-wire aria-hidden />
      <div className="container">
        {full ? null : (
          <header className="section-head">
            <p className="eyebrow eyebrow--accent" data-reveal>
              {d.join.eyebrow}
            </p>
            <h2 className="display-1" id="join-title" data-reveal>
              {d.join.title}
            </h2>
            <p className="lede" data-reveal>
              {d.join.lede}
            </p>
          </header>
        )}

        <ol className="ways">
          <li className="way" data-reveal>
            <span className="way__n">01</span>
            <Title className="display-2">{d.join.way1Title}</Title>
            <p>{d.join.way1Body}</p>
            {next ? (
              <Link className="btn btn--primary" href={eventHref(next.slug, lang)} data-magnetic>
                {d.join.signup} · {shortDate(next.date, lang)}
                <span aria-hidden className="btn__arrow">
                  →
                </span>
              </Link>
            ) : null}
          </li>
          <li className="way" data-reveal>
            <span className="way__n">02</span>
            <Title className="display-2">{d.join.way2Title}</Title>
            <p>{d.join.way2Body}</p>
            {/* Le QR code lui-même n'existe qu'aux événements : ici, son dessin. */}
            <svg className="way__qr" viewBox="0 0 84 84" aria-hidden focusable="false">
              <path
                d="M6 6h24v24H6zM54 6h24v24H54zM6 54h24v24H6zM14 14h8v8h-8zM62 14h8v8h-8zM14 62h8v8h-8zM38 6h8v8h-8zM38 22h8v16h-8zM6 38h16v8H6zM30 38h8v8h-8zM54 38h8v8h-8zM70 38h8v16h-8zM38 54h16v8H38zM62 62h8v8h-8zM46 70h8v8h-8zM70 70h8v8h-8z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </li>
        </ol>

        <div className="join__more">
          <div data-reveal>
            <p className="eyebrow">{d.join.opensTitle}</p>
            <p>{d.join.opensBody}</p>
          </div>
          <div data-reveal>
            <p className="eyebrow">{d.join.beforeTitle}</p>
            <p>{d.join.beforeBody}</p>
            <a className="link link--arrow" href={EN_ONLY.setup}>
              {d.join.beforeTitle}
              {lang === "en" ? "" : ` (${d.join.beforeNote})`}
            </a>
          </div>
          {full ? null : (
            <div data-reveal>
              <Link className="btn btn--ghost" href={href("join", lang)} data-magnetic>
                {d.join.more}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
