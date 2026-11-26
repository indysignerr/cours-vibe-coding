import type { BulbHandle, BulbView } from "@/components/home/bulb-scene";

/**
 * L'ampoule, dans un fil de travail.
 *
 * Toute la scène 3D tourne ici, à l'écart de la page : le chargement de
 * three.js, la mise en route, puis chaque image. La page, elle, garde son
 * fil pour le texte, le défilement et les clics. C'est ce qui permet une
 * scène lourde en haut de page sans que la page le paie : sur un
 * téléphone modeste, lire three.js dans la page la figeait une demi-seconde.
 *
 * Le cadre (`bulb.tsx`) confie son canevas, puis envoie des ordres : la
 * taille, lecture ou pause, la souris. Le fil répond quand l'ampoule est
 * prête, quand elle s'allume, ou s'il n'y arrive pas.
 */
export type ToBulb =
  | { type: "start"; canvas: OffscreenCanvas; view: BulbView; fine: boolean }
  | { type: "resize"; view: BulbView }
  | { type: "play" }
  | { type: "pause" }
  | { type: "pop" }
  | { type: "pointer"; x: number; y: number }
  | { type: "hover"; at: { x: number; y: number } | null }
  | { type: "seek"; t: number; burst?: number };

export type FromBulb = { type: "live" } | { type: "lit" } | { type: "lost" } | { type: "failed" };

const scope = self as unknown as {
  postMessage(message: FromBulb): void;
  onmessage: ((event: MessageEvent<ToBulb>) => void) | null;
};

let handle: BulbHandle | null = null;
// Ce qui arrive pendant la mise en route est retenu, et appliqué à la fin.
let view: BulbView | null = null;
let playing = false;

async function start(order: Extract<ToBulb, { type: "start" }>) {
  try {
    view = order.view;
    // Sans carte graphique, la scène se dessinerait au processeur : on
    // s'arrête là, avant même de charger three.js.
    const context = order.canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: true,
    });
    if (!context || typeof requestAnimationFrame !== "function") throw new Error("no bulb here");

    const { createBulb } = await import("@/components/home/bulb-scene");
    const made = await createBulb(order.canvas, order.view, {
      context,
      fine: order.fine,
      onLost: () => scope.postMessage({ type: "lost" }),
      onLit: () => scope.postMessage({ type: "lit" }),
    });
    if (view !== order.view) made.resize(view);
    handle = made;
    scope.postMessage({ type: "live" });
    if (playing) made.play();
  } catch {
    scope.postMessage({ type: "failed" });
  }
}

scope.onmessage = ({ data }) => {
  switch (data.type) {
    case "start":
      void start(data);
      break;
    case "resize":
      view = data.view;
      handle?.resize(data.view);
      break;
    case "play":
      playing = true;
      handle?.play();
      break;
    case "pause":
      playing = false;
      handle?.pause();
      break;
    case "pop":
      handle?.pop();
      break;
    case "pointer":
      handle?.pointer(data.x, data.y);
      break;
    case "hover":
      handle?.hover(data.at);
      break;
    case "seek":
      handle?.seek(data.t, data.burst);
      break;
  }
};
