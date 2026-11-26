import type { FaqItem } from "@/lib/faq";

/**
 * Une liste de questions : un <details> par question.
 *
 * Pas de script : le clavier, le lecteur d'écran et la recherche dans la
 * page (qui ouvre la réponse où se trouve le mot cherché) viennent avec
 * l'élément. `name` relie les questions d'une même liste : en ouvrir une
 * referme la précédente.
 */
export function FaqList({
  items,
  name,
  anchors = false,
}: {
  items: FaqItem[];
  /** Le groupe exclusif de ces questions. */
  name: string;
  /** Donner à chaque question son ancre (/faq/#cost) : la page FAQ seulement. */
  anchors?: boolean;
}) {
  return (
    <div className="faq__list">
      {items.map((i) => (
        <details key={i.id} className="qa" name={name} id={anchors ? i.id : undefined}>
          <summary className="qa__q">
            <span>{i.q}</span>
            <span className="qa__mark" aria-hidden />
          </summary>
          <div className="qa__a">
            <p>{i.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
