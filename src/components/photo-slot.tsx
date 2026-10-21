/**
 * Emplacement photo.
 *
 * Marque la place d'une vraie photographie tant qu'elle n'existe pas.
 * Volontairement sobre et légendé : un bloc gris anonyme se fait oublier
 * et finit en production, une légende qui dit ce qu'on attend se remarque.
 *
 * Aucune image de banque : montrer une équipe qui n'est pas la vôtre est
 * pire que ne rien montrer.
 */
export function PhotoSlot({
  label,
  ratio = "4 / 3",
  className = "",
}: {
  label: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <figure
      className={`flex items-center justify-center overflow-hidden rounded-card bg-sunken ${className}`}
      style={{ aspectRatio: ratio, boxShadow: "inset 0 0 0 1px var(--line-strong)" }}
    >
      <figcaption className="max-w-[24ch] px-6 text-center">
        <span className="eyebrow eyebrow--accent block">Photo to come</span>
        <span className="mt-3 block text-sm text-muted">{label}</span>
      </figcaption>
    </figure>
  );
}
