"use client";

import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand";
import type { BulbHandle, BulbView } from "@/components/home/bulb-scene";
import type { FromBulb, ToBulb } from "@/components/home/bulb.worker";
import { fineOn, motionOn } from "@/lib/motion";

/**
 * Le cadre de l'ampoule du haut de page.
 *
 * Il réserve la place, lance la scène 3D en différé (rien d'elle n'est
 * sur le chemin du premier affichage), la fait tourner quand elle est à
 * l'écran et la met en pause dès qu'elle en sort. Il lui passe aussi les
 * gestes : la souris et le clic. Pas le défilement : l'ampoule ne s'ouvre
 * que si on le lui demande.
 *
 * La scène tourne dans un fil de travail (`bulb.worker.ts`) : three.js y
 * est chargé et chaque image y est calculée, sans jamais occuper le fil
 * de la page. Si le navigateur ne sait pas faire (ou si le fil échoue),
 * elle tourne dans la page, sur un canevas neuf : celui qu'on a confié au
 * fil ne revient pas.
 *
 * Quatre cas où il n'y a pas de 3D, et où le logo dessiné prend la place :
 * sans JavaScript, en mouvement réduit, sans carte graphique (three.js
 * n'est alors même pas chargé), et si WebGL se perd en route.
 * L'ampoule est décorative (`aria-hidden`) : elle ne dit rien que le
 * titre ne dise.
 */
export function Bulb() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"wait" | "live" | "failed">("wait");
  // L'essai en cours : son numéro (un canevas neuf à chaque fois), et si
  // la scène tourne à part. `null` : on ne sait pas encore, on essaie à part.
  const [attempt, setAttempt] = useState<{ n: number; apart: boolean | null }>({
    n: 0,
    apart: null,
  });

  useEffect(() => {
    const el = stage.current;
    const cv = canvas.current;
    if (!el || !cv || !motionOn()) return;

    let dead = false;
    let asked = false;
    let seen = false;
    let bulb: BulbHandle | null = null;
    const fine = fineOn();
    const hero = el.closest("section");
    // Quand l'ampoule s'allume, le dernier mot du titre s'allume avec elle.
    const lit = () => hero?.setAttribute("data-lit", "");
    const apart =
      attempt.apart ??
      (typeof Worker !== "undefined" && typeof cv.transferControlToOffscreen === "function");

    /** Ce que la scène doit savoir de la page : elle ne peut pas la mesurer elle-même. */
    const measure = (): BulbView => {
      const view = cv.getBoundingClientRect();
      const area = el.getBoundingClientRect();
      return {
        width: cv.clientWidth,
        height: cv.clientHeight,
        ratio: window.devicePixelRatio || 1,
        cx: area.left + area.width / 2 - view.left,
        cy: area.top + area.height / 2 - view.top,
        areaWidth: area.width,
        areaHeight: area.height,
      };
    };
    const sync = () => {
      if (!bulb) return;
      if (seen && !document.hidden) bulb.play();
      else bulb.pause();
    };

    /** La scène dans la page : pour les navigateurs sans fil de travail graphique. */
    const inPage = async (): Promise<BulbHandle> => {
      // Sans carte graphique, WebGL dessinerait au processeur : on s'en
      // assure avant même de charger three.js, et on garde le logo dessiné.
      // Le contexte ouvert ici est celui dont la scène se servira.
      const context = cv.getContext("webgl2", {
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      });
      if (!context) throw new Error("no hardware WebGL");
      const { createBulb } = await import("@/components/home/bulb-scene");
      return createBulb(cv, measure(), {
        context,
        fine,
        onLost: () => setState("failed"),
        onLit: lit,
      });
    };

    /** La scène à part : le canevas est confié au fil, et on lui parle par messages. */
    const inWorker = (): Promise<BulbHandle> =>
      new Promise((resolve, reject) => {
        const offscreen = cv.transferControlToOffscreen();
        const worker = new Worker(new URL("./bulb.worker.ts", import.meta.url), {
          type: "module",
        });
        const send = (order: ToBulb, moved: Transferable[] = []) =>
          worker.postMessage(order, moved);
        const remote: BulbHandle = {
          play: () => send({ type: "play" }),
          pause: () => send({ type: "pause" }),
          resize: (view) => send({ type: "resize", view }),
          pointer: (x, y) => send({ type: "pointer", x, y }),
          hover: (at) => send({ type: "hover", at }),
          pop: () => send({ type: "pop" }),
          seek: (t, burst) => send({ type: "seek", t, burst }),
          dispose: () => worker.terminate(),
        };
        const fail = () => {
          worker.terminate();
          reject(new Error("no bulb in a worker"));
        };
        worker.onmessage = ({ data }: MessageEvent<FromBulb>) => {
          if (data.type === "live") resolve(remote);
          else if (data.type === "lit") lit();
          else if (data.type === "lost") setState("failed");
          else fail();
        };
        worker.onerror = fail;
        send({ type: "start", canvas: offscreen, view: measure(), fine }, [offscreen]);
      });

    const load = async () => {
      if (dead) return;
      try {
        const made = await (apart ? inWorker() : inPage());
        if (dead) {
          made.dispose();
          return;
        }
        bulb = made;
        made.resize(measure());
        // En développement, l'ampoule se pilote depuis la console : __bulb.seek(1.2).
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __bulb?: BulbHandle }).__bulb = made;
        }
        setState("live");
        sync();
      } catch {
        if (dead) return;
        if (apart) {
          // Le fil n'y arrive pas : un canevas neuf, et la scène dans la page.
          setAttempt((now) => ({ n: now.n + 1, apart: false }));
          return;
        }
        setState("failed");
        lit();
      }
    };

    const idle = window.requestIdleCallback ?? ((fn: () => void) => window.setTimeout(fn, 200));
    const sight = new IntersectionObserver(
      ([entry]) => {
        seen = entry.isIntersecting;
        if (seen && !asked) {
          asked = true;
          idle(() => void load(), { timeout: 900 });
        }
        sync();
      },
      { threshold: 0.15 },
    );
    sight.observe(el);

    const sized = new ResizeObserver(() => bulb?.resize(measure()));
    sized.observe(el);
    sized.observe(cv);
    // L'ampoule ne réagit ni au défilement ni au doigt qui glisse : elle
    // resterait à s'ouvrir chaque fois qu'on fait défiler la page. Seule la
    // souris la fait tourner un peu et écarte les panneaux qu'elle survole.
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !bulb) return;
      if (fine) {
        bulb.pointer(
          (event.clientX / window.innerWidth - 0.5) * 2,
          (event.clientY / window.innerHeight - 0.5) * 2,
        );
      }
      const box = cv.getBoundingClientRect();
      if (!box.width || !box.height) return;
      bulb.hover({
        x: ((event.clientX - box.left) / box.width) * 2 - 1,
        y: -(((event.clientY - box.top) / box.height) * 2 - 1),
      });
    };
    const onLeave = () => bulb?.hover(null);
    // L'éclat est un geste voulu : un clic sur l'ampoule, ou un toucher
    // bref qui ne glisse pas. Un doigt qui fait défiler ne déclenche rien.
    let press: { x: number; y: number; at: number } | null = null;
    const onDown = (event: PointerEvent) => {
      press = { x: event.clientX, y: event.clientY, at: event.timeStamp };
    };
    const onUp = (event: PointerEvent) => {
      const from = press;
      press = null;
      if (!from) return;
      const still = Math.hypot(event.clientX - from.x, event.clientY - from.y) < 8;
      const brief = event.timeStamp - from.at < 400;
      const box = el.getBoundingClientRect();
      const inside =
        event.clientX > box.left &&
        event.clientX < box.right &&
        event.clientY > box.top &&
        event.clientY < box.bottom;
      const onControl = (event.target as Element | null)?.closest?.("a, button, summary, input");
      if (still && brief && inside && !onControl) bulb?.pop();
    };
    const onCancel = () => {
      press = null;
    };
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onCancel, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      dead = true;
      sight.disconnect();
      sized.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      bulb?.dispose();
    };
  }, [attempt]);

  return (
    <div
      ref={stage}
      className={state === "live" ? "bulb is-live" : state === "failed" ? "bulb is-failed" : "bulb"}
      aria-hidden="true"
    >
      <div className="bulb__fallback">
        <BrandMark className="bulb__mark" outline="var(--ink)" glyph="var(--brand)" />
      </div>
      <canvas key={attempt.n} ref={canvas} className="bulb__canvas" />
    </div>
  );
}
