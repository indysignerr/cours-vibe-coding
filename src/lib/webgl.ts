/**
 * Deux précautions que prend toute scène 3D du site avant de dessiner.
 *
 * Elles viennent d'une mesure : sur un navigateur qui n'a jamais vu le
 * site, la mise en route d'une scène peut figer l'écran plus d'une
 * seconde. Une fois le site visité, le navigateur garde les programmes
 * graphiques en cache et on ne voit plus rien : c'est donc la première
 * visite, celle de presque tout le monde, qu'il faut soigner.
 */

/**
 * Y a-t-il une carte graphique ? Sans elle WebGL dessine au processeur,
 * image par image : on préfère alors l'image fixe, sans rien télécharger.
 */
export function hardwareWebGL(): boolean {
  try {
    const probe = document
      .createElement("canvas")
      .getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!probe) return false;
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Attend que la carte graphique ait fini ce qu'on vient de lui demander,
 * sans bloquer la page.
 *
 * Un dessin part dans une file : la fonction qui le demande rend la main
 * tout de suite, que la carte ait fini ou non. Pour roder les programmes
 * un par un (leur premier dessin est le plus long), il faut savoir quand
 * le précédent est vraiment passé. On pose donc un repère dans la file et
 * on regarde de temps en temps s'il a été atteint. `limit` borne
 * l'attente : si le repère ne vient pas, on continue quand même.
 */
export function gpuSettled(gl: WebGL2RenderingContext, limit = 4000): Promise<void> {
  return new Promise((done) => {
    const mark = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!mark) return done();
    gl.flush();
    const until = performance.now() + limit;
    const look = () => {
      const state = gl.isContextLost() ? gl.WAIT_FAILED : gl.clientWaitSync(mark, 0, 0);
      if (state === gl.TIMEOUT_EXPIRED && performance.now() < until) {
        setTimeout(look, 8);
        return;
      }
      gl.deleteSync(mark);
      done();
    };
    setTimeout(look, 0);
  });
}
