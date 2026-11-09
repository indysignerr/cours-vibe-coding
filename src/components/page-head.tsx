/**
 * Le haut d'une page intérieure : surtitre, titre, chapeau.
 * Décalé à gauche, jamais centré ; le fil de la page part d'ici.
 */
export function PageHead({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-head">
      <div className="container">
        {eyebrow ? <p className="eyebrow eyebrow--accent page-head__in" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</p> : null}
        <h1 className="display-1 page-head__in" style={{ "--i": 1 } as React.CSSProperties}>
          {title}
        </h1>
        {lede ? (
          <p className="lede page-head__lede page-head__in" style={{ "--i": 2 } as React.CSSProperties}>
            {lede}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
