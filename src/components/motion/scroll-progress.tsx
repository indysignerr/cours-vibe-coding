/**
 * Le filet d'avancement de page.
 *
 * Plus une ligne de JavaScript : `animation-timeline: scroll()` attache
 * l'animation au défilement du document directement dans le moteur de
 * rendu. Elle tourne sur le compositeur, hors du fil principal, donc
 * elle ne peut pas saccader le défilement — ce qui était le cas de la
 * version précédente, un ressort Framer abonné à chaque évènement.
 *
 * Les navigateurs qui ne connaissent pas les timelines de défilement
 * n'appliquent simplement rien : la barre reste à zéro et personne ne
 * perd rien d'important.
 */
export function ScrollProgress() {
  return <div aria-hidden className="scroll-progress" />;
}
