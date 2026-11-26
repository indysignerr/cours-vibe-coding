/**
 * L'en-tête d'une section : un filet plein, le numéro et le nom de la
 * section dans la marge, le titre dans la colonne de lecture.
 *
 * C'est la même mise en page pour toutes les sections du site, comme les
 * têtes de chapitre d'un rapport. Le filet se trace à l'arrivée
 * (`data-rule`, branché par ScrollFX).
 */
export function SectionHead({
  n,
  label,
  title,
  id,
  lede,
  as: Title = "h2",
}: {
  /** Le numéro d'ordre dans la page, « 01 ». Absent sur les pages intérieures. */
  n?: string;
  label: string;
  title: string;
  /** L'identifiant du titre, pour `aria-labelledby` sur la section. */
  id?: string;
  lede?: string;
  as?: "h2" | "h3";
}) {
  return (
    <header className="sec-head" data-rule>
      <p className="sec-head__label" data-reveal>
        {n ? <span className="sec-head__n">{n}</span> : null}
        <span>{label}</span>
      </p>
      <div>
        <Title className="display-1 sec-head__title" id={id} data-reveal>
          {title}
        </Title>
        {lede ? (
          <p className="lede sec-head__lede" data-reveal>
            {lede}
          </p>
        ) : null}
      </div>
    </header>
  );
}
