import { Fragment } from "react";

/**
 * Un titre qui se révèle mot à mot au défilement.
 *
 * Chaque mot est enfermé dans une fenêtre à `overflow: hidden` et monte
 * derrière elle. Le décalage entre mots ne peut pas être un délai — une
 * timeline de défilement n'avance pas dans le temps — alors c'est la
 * plage de chaque mot qui glisse, mot après mot.
 *
 * Composant serveur, et le texte reste du texte : un lecteur d'écran lit
 * la phrase entière, le moteur de recherche aussi.
 */
export function Split({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const words = children.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        // L'espace se met ENTRE les fenêtres, jamais dedans : un
        // `inline-block` à `overflow: hidden` avale l'espace qu'il
        // contient, et la phrase se recolle en un seul bloc.
        <Fragment key={`${word}-${i}`}>
          <span className="sw" style={{ "--w": i } as React.CSSProperties}>
            <span className="sw__i">{word}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
