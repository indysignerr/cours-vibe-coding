/**
 * Le haut d'une page intérieure : surtitre, titre, chapeau.
 * Aligné à gauche, jamais centré. Le titre monte sans passer par la
 * transparence : c'est lui que le navigateur chronomètre.
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
        {eyebrow ? (
          <p className="eyebrow eyebrow--accent rise" style={{ "--i": 0 } as React.CSSProperties}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className="display-1 rise rise--solid" style={{ "--i": 1 } as React.CSSProperties}>
          {title}
        </h1>
        {lede ? (
          <p className="lede page-head__lede rise" style={{ "--i": 2 } as React.CSSProperties}>
            {lede}
          </p>
        ) : null}
        {children}
      </div>
    </header>
  );
}
