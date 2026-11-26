import Link from "next/link";
import { NextSignup } from "@/components/next-event";
import { Chapter } from "@/components/section-head";
import { today } from "@/lib/events";
import { EN_ONLY, href, t, type Locale } from "@/lib/i18n";
import { timelineItems } from "@/lib/timeline";

/**
 * Rejoindre : deux voies d'entrée, côte à côte.
 *
 * Ce que le plan dit tient en trois faits : le formulaire d'inscription
 * porte une case « join Albert LIGHT », un QR code permet de rejoindre
 * sur place, et les débutants sont bienvenus. Rien d'autre n'est décidé,
 * donc rien d'autre n'est écrit.
 */
export function JoinBlock({
  lang,
  n,
  full = false,
}: {
  lang: Locale;
  n?: string;
  /** La page Rejoindre montre tout sous son propre titre ; l'accueil renvoie vers elle. */
  full?: boolean;
}) {
  const d = t(lang);
  const Title = full ? "h2" : "h3";

  return (
    <section className="section join" aria-labelledby={full ? undefined : "join-title"}>
      <div className="container">
        {full ? (
          <>
            <ol className="ways" data-reveal>
              <li className="way">
                <span className="way__n" aria-hidden>
                  1
                </span>
                <Title className="display-2">{d.join.way1Title}</Title>
                <p>{d.join.way1Body}</p>
                <NextSignup label={d.join.signup} items={timelineItems(lang)} buildDay={today()} />
              </li>
              <li className="way">
                <span className="way__n" aria-hidden>
                  2
                </span>
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
                <a className="link link--block" href={EN_ONLY.setup}>
                  {d.join.beforeTitle}
                  {lang === "en" ? "" : ` (${d.join.beforeNote})`}
                </a>
              </div>
            </div>
          </>
        ) : (
          <Chapter
            n={n}
            label={d.join.eyebrow}
            title={d.join.title}
            id="join-title"
            lede={d.join.lede}
            foot={
              <Link className="link link--block" href={href("join", lang)}>
                {d.join.more}
              </Link>
            }
          >
            <ol className="ways" data-reveal>
              <li className="way">
                <span className="way__n" aria-hidden>
                  1
                </span>
                <Title className="display-2">{d.join.way1Title}</Title>
                <p>{d.join.way1Body}</p>
                <NextSignup label={d.join.signup} items={timelineItems(lang)} buildDay={today()} />
              </li>
              <li className="way">
                <span className="way__n" aria-hidden>
                  2
                </span>
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
                <a className="link link--block" href={EN_ONLY.setup}>
                  {d.join.beforeTitle}
                  {lang === "en" ? "" : ` (${d.join.beforeNote})`}
                </a>
              </div>
            </div>
          </Chapter>
        )}
      </div>
    </section>
  );
}
