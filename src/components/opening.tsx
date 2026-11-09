"use client";

import { useEffect, useRef } from "react";
import { BulbMark } from "@/components/bulb-mark";

/**
 * L'ouverture, en quatre actes.
 *
 *   I   0,0 → 0,9 s   Le noir. Un compteur grimpe, des lignes balaient
 *                     l'écran comme un scanner.
 *   II  0,7 → 1,9 s   ALBERT L.I.G.H.T. se construit lettre par lettre,
 *                     dans le désordre, avec des caractères parasites
 *                     qui se fixent — un décodage, pas un fondu.
 *   III 1,9 → 2,7 s   L'ampoule traverse l'écran, percute le I, et la
 *                     lumière explose.
 *   IV  2,7 → 3,5 s   Deux volets s'ouvrent en diagonale et la page
 *                     arrive derrière, en zoom arrière.
 *
 * La page est entière sous le rideau : robots, lecteurs d'écran et
 * navigateurs sans JavaScript ne le voient jamais. La séquence ne joue
 * qu'une fois par session, et un filet la retire au bout de 6 s quoi
 * qu'il arrive — un rideau coincé, c'est un site mort.
 */

const SEEN = "albert-light:opened";
const WORD = "ALBERTLIGHT";
const NOISE = "▓▒░#@%&*+=/\\<>|01";

export function Opening() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    // On cache le rideau, on ne retire pas le nœud : il appartient à React,
    // qui le retrouverait absent au prochain rendu de <body> et planterait
    // ses insertBefore/removeChild.
    const done = () => {
      el.hidden = true;
      document.documentElement.classList.remove("is-opening");
    };

    const skip =
      sessionStorage.getItem(SEEN) === "1" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (skip) {
      done();
      return;
    }

    sessionStorage.setItem(SEEN, "1");
    // `is-opening` le temps du rideau ; `opened` reste : la scène sait alors
    // que l'ampoule vient de tomber et ne la fait pas tomber une deuxième fois.
    document.documentElement.classList.add("is-opening", "opened");
    const net = window.setTimeout(done, 6000);

    let killed = false;
    void import("gsap").then(({ gsap }) => {
      if (killed) return;
      const q = gsap.utils.selector(el);
      const letters = q(".op-letter");
      const counter = el.querySelector(".op-count") as HTMLElement | null;

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          window.clearTimeout(net);
          done();
        },
      });

      tl.set(el, { autoAlpha: 1 });

      // ---- Acte I : le scanner et le compteur -------------------------
      tl.fromTo(
        q(".op-scan"),
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.35, stagger: 0.06 },
        0,
      );

      if (counter) {
        const n = { v: 0 };
        tl.to(
          n,
          {
            v: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              counter.textContent = String(Math.round(n.v)).padStart(3, "0");
            },
          },
          0.1,
        );
      }

      // ---- Acte II : le décodage --------------------------------------
      // Chaque lettre passe par des caractères parasites avant de se fixer.
      letters.forEach((node, i) => {
        const real = node.dataset.char ?? "";
        const scramble = { frame: 0 };
        tl.to(
          scramble,
          {
            frame: 10,
            duration: 0.42,
            ease: "none",
            onUpdate: () => {
              const p = scramble.frame / 10;
              node.textContent =
                p > 0.75
                  ? real
                  : NOISE[Math.floor(Math.random() * NOISE.length)];
            },
            onComplete: () => {
              node.textContent = real;
            },
          },
          0.7 + i * 0.045,
        );

        tl.fromTo(
          node,
          {
            opacity: 0,
            y: gsap.utils.random(-28, 28),
            rotateX: gsap.utils.random(-70, 70),
          },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.5 },
          0.7 + i * 0.045,
        );
      });

      // ---- Acte III : l'ampoule percute -------------------------------
      tl.fromTo(
        q(".op-bulb"),
        { xPercent: 420, yPercent: -40, rotate: -120, opacity: 0 },
        {
          xPercent: 0,
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 0.6,
          ease: "power4.in",
        },
        1.9,
      )
        // L'impact : la lettre visée s'écrase, l'ampoule s'aplatit.
        .to(
          q(".op-target"),
          { scaleY: 0.1, scaleX: 1.5, opacity: 0, duration: 0.12 },
          2.46,
        )
        .to(q(".op-bulb"), { scaleY: 0.74, scaleX: 1.3, duration: 0.1 }, 2.46)
        .to(q(".op-bulb"), {
          scaleY: 1,
          scaleX: 1,
          duration: 0.45,
          ease: "elastic.out(1, 0.4)",
        })
        // Les autres lettres encaissent le choc.
        .to(
          letters,
          { y: 14, duration: 0.1, stagger: { each: 0.012, from: "center" } },
          2.46,
        )
        .to(
          letters,
          { y: 0, duration: 0.5, ease: "elastic.out(1, 0.45)" },
          2.58,
        )
        // L'allumage, puis l'explosion de lumière.
        .to(q(".op-filament"), { opacity: 1, duration: 0.08 }, 2.5)
        .to(
          q(".op-rays"),
          { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)" },
          2.56,
        )
        .fromTo(
          q(".op-burst"),
          { scale: 0, opacity: 0.95 },
          { scale: 14, opacity: 0, duration: 0.7, ease: "power2.out" },
          2.58,
        )
        .to(
          q(".op-ring"),
          { scale: 9, opacity: 0, duration: 0.8, ease: "power2.out" },
          2.62,
        );

      // ---- Acte IV : les volets ---------------------------------------
      tl.to(q(".op-ui"), { opacity: 0, duration: 0.25 }, 2.95)
        .to(
          q(".op-shutter--top"),
          { yPercent: -102, duration: 0.75, ease: "power4.inOut" },
          3.0,
        )
        .to(
          q(".op-shutter--bottom"),
          { yPercent: 102, duration: 0.75, ease: "power4.inOut" },
          3.0,
        )
        .fromTo(
          "#main",
          { scale: 1.07, opacity: 0.4 },
          { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" },
          3.05,
        )
        .set(el, { autoAlpha: 0 }, 3.7);
    });

    return () => {
      killed = true;
      window.clearTimeout(net);
    };
  }, []);

  return (
    <div ref={root} className="opening" aria-hidden>
      {/* Les volets : ils s'ouvrent sur la page. */}
      <span className="op-shutter op-shutter--top" />
      <span className="op-shutter op-shutter--bottom" />

      <div className="op-ui">
        {/* Acte I : le scanner */}
        <span className="op-scans">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="op-scan"
              style={{ "--n": i } as React.CSSProperties}
            />
          ))}
        </span>

        <span className="op-count">000</span>

        {/* Acte II : le mot qui se décode */}
        <span className="op-word">
          {WORD.split("").map((char, i) => (
            <span
              key={`${char}-${i}`}
              data-char={char}
              className={`op-letter${i === 7 ? " op-target" : ""}`}
            >
              {char}
            </span>
          ))}

          {/* Acte III : l'ampoule vise le I, huitième caractère. */}
          <span className="op-bulb">
            <span className="op-burst" />
            <span className="op-ring" />
            <BulbMark
              className="op-bulb__svg"
              raysClassName="op-rays"
              filamentClassName="op-filament"
            />
          </span>
        </span>
      </div>
    </div>
  );
}
