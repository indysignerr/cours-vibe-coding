/**
 * Deux questions que tout composant animé pose avant de bouger. Les
 * réponses sont lues sur les classes que le script de <RootShell> pose
 * sur <html> avant la première peinture.
 */

/** Les animations peuvent-elles tourner ? Faux en mouvement réduit. */
export const motionOn = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("motion");

/** Grand écran à souris : là où le défilement est lissé. */
export const fineOn = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("fine");
