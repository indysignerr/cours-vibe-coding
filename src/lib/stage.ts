/**
 * L'état partagé de la scène : la lumière (l'easter egg) et le son.
 *
 * Deux petits magasins hors de React. La boucle 3D, l'interrupteur de la
 * dernière section, le bouton de l'en-tête et la classe posée sur <html>
 * lisent tous la même valeur, sans contexte à traverser ni rendu à
 * provoquer pour ceux que ça ne concerne pas.
 */
type Listener = () => void;

function store<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set(next: T) {
      if (next === value) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

/** La lumière est-elle allumée ? */
export const litStore = store(false);

/** Le son d'allumage est-il activé ? Désactivé par défaut. */
export const soundStore = store(false);
export const SOUND_KEY = "albert-light:sound";
