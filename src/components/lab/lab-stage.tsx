"use client";

import {
  Component,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
  type RefObject,
} from "react";
import { fineOn, motionOn } from "@/lib/motion";
import { hardwareWebGL } from "@/lib/webgl";

/**
 * Le cadre de la maquette : ce qui colle à l'écran pendant que les
 * piliers défilent.
 *
 * Il fait trois choses.
 *   1. Mesurer où en est le défilement parmi les quatre piliers. Le
 *      résultat est un nombre de 0 à 3, écrit dans une référence : la
 *      scène 3D le lit à chaque image sans qu'aucun rendu React ne soit
 *      provoqué. Seul le changement de pilier courant passe par l'état.
 *   2. Montrer l'image fixe de la pièce courante, en attendant la scène.
 *   3. Charger la scène 3D en différé, quand la section approche de
 *      l'écran, et la laisser prendre la place de l'image une fois prête.
 *      Si WebGL manque ou échoue, l'image reste : la page marche pareil.
 *
 * La scène ne doit jamais faire sauter la page. Elle attend donc que
 * l'ouverture du haut de page soit jouée (sauf si on est déjà devant
 * elle), son décor se construit par petites tranches, et sans carte
 * graphique elle n'est même pas téléchargée.
 *
 * En mouvement réduit, ce composant ne fait rien : la feuille de style
 * ne l'affiche même pas, et chaque pilier montre l'image de sa pièce.
 */
type SceneProps = {
  progress: RefObject<number>;
  running: boolean;
  fine: boolean;
  onReady: () => void;
};

/** Le temps laissé à l'ouverture du haut de page, en millisecondes. */
const OPENING = 6500;

export type StageRoom = { key: string; poster: string; caption: string };

/** Si la scène 3D plante, on garde l'image fixe. */
class Guard extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function LabStage({ rooms }: { rooms: StageRoom[] }) {
  const el = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
  const [running, setRunning] = useState(false);
  const [live, setLive] = useState(false);
  // L'image s'efface en fondu derrière la scène, puis quitte la page.
  const [faded, setFaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const stage = el.current;
    const section = stage?.closest("section");
    if (!stage || !section || !motionOn()) return;
    setFine(fineOn());

    const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-step]"));
    const born = performance.now();
    let frame = 0;
    let wait = 0;
    let seen = false;
    let current = 0;

    const measure = () => {
      frame = 0;
      if (steps.length === 0) return;
      // La ligne de lecture : un peu au-dessus du milieu de la zone où le
      // texte défile (sous la maquette au téléphone, à côté sur grand écran).
      const beside = window.matchMedia("(min-width: 1000px)").matches;
      const top = beside ? stage.getBoundingClientRect().top : stage.getBoundingClientRect().bottom;
      const line = top + (window.innerHeight - top) * 0.42;
      const centres = steps.map((s) => {
        const r = s.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let p = steps.length - 1;
      if (line <= centres[0]) p = 0;
      else {
        for (let i = 0; i < centres.length - 1; i++) {
          if (line < centres[i + 1]) {
            p = i + (line - centres[i]) / (centres[i + 1] - centres[i]);
            break;
          }
        }
      }
      progress.current = p;
      const next = Math.round(p);
      if (next !== current) {
        current = next;
        setActive(next);
      }
    };
    const queue = () => {
      if (seen && !frame) frame = requestAnimationFrame(measure);
    };

    // De loin : on commence à charger la scène, une fois l'ouverture du
    // haut de page jouée. À l'écran : elle se charge sans attendre, et tourne.
    const approach = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        approach.disconnect();
        wait = window.setTimeout(
          () => setNear(true),
          Math.max(0, OPENING - (performance.now() - born)),
        );
      },
      { rootMargin: "120% 0px" },
    );
    approach.observe(section);
    const sight = new IntersectionObserver(([entry]) => {
      seen = entry.isIntersecting;
      if (seen) {
        window.clearTimeout(wait);
        setNear(true);
      }
      setRunning(seen && !document.hidden);
      queue();
    });
    sight.observe(stage);
    const onVisibility = () => setRunning(seen && !document.hidden);

    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(wait);
      approach.disconnect();
      sight.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // La scène : on vérifie la carte graphique, on télécharge, on construit
  // le décor par tranches, et seulement alors on la monte.
  useEffect(() => {
    if (!near) return;
    let off = false;
    (async () => {
      try {
        // Sans carte graphique, WebGL dessinerait au processeur : l'image reste.
        if (!hardwareWebGL()) throw new Error("no hardware WebGL");

        const lab = await import("@/components/lab/lab-canvas");
        await lab.prepareLab();
        if (!off) setScene(() => lab.default);
      } catch {
        if (!off) setFailed(true);
      }
    })();
    return () => {
      off = true;
    };
  }, [near]);

  return (
    <div ref={el} className={live && !failed ? "stage is-live" : "stage"} aria-hidden="true">
      <div className="stage__view">
        {/* Une seule image à la fois, celle de la pièce courante : les trois
            autres ne sont demandées que si on y arrive avant la scène 3D. Une
            fois la scène en place, plus aucune ne l'est. */}
        {faded && !failed ? null : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={rooms[active]?.key}
            className="stage__poster is-on"
            src={rooms[active]?.poster}
            width={1200}
            height={900}
            alt=""
            loading="lazy"
          />
        )}
        {Scene && !failed ? (
          <div className="stage__canvas">
            <Guard onError={() => setFailed(true)}>
              <Scene
                progress={progress}
                running={running}
                fine={fine}
                onReady={() => {
                  setLive(true);
                  window.setTimeout(() => setFaded(true), 900);
                }}
              />
            </Guard>
          </div>
        ) : null}
      </div>
      <div className="stage__foot">
        <p className="figcap stage__cap">{rooms[active]?.caption}</p>
        <ol className="stage__ticks">
          {rooms.map((r, i) => (
            <li key={r.key} className={i === active ? "is-on" : undefined}>
              {String(i + 1).padStart(2, "0")}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
