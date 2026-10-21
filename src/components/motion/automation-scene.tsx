"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "@/components/motion/gsap";

/**
 * La démonstration, en motion design.
 *
 * Une structure neuve n'a pas de portfolio. Ce qu'elle peut montrer, c'est
 * le raisonnement : une tâche faite à la main, le coût de cette tâche, puis
 * le même flux câblé une fois. La scène se joue au défilement, épinglée.
 *
 * Elle est décorative au sens de l'accessibilité : le même contenu est écrit
 * en toutes lettres dans la liste de secours, qui reste la seule chose
 * affichée quand le système demande moins de mouvement.
 */

const ROWS = 9;

const ACTS = [
  {
    kicker: "Monday, 9 a.m.",
    title: "Forty orders arrive by email.",
    note: "Different formats, different senders, the same four fields buried in each one.",
  },
  {
    kicker: "Monday, all morning",
    title: "Someone retypes them, one by one.",
    note: "Three hours. Every week. The person doing it is not the problem — the process is.",
  },
  {
    kicker: "What we do",
    title: "We wire it once.",
    note: "One scenario, your own instance, your own licence. Two weeks, and a document so your team can change it without us.",
  },
  {
    kicker: "Tuesday onwards",
    title: "Nobody retypes anything.",
    note: "The three hours go back into the week. The audit trail is better than it was by hand.",
  },
];

export function AutomationScene() {
  const root = useRef<HTMLDivElement>(null);
  const [act, setAct] = useState(0);
  const [minutes, setMinutes] = useState(0);
  /**
   * Repli en texte. Deux cas :
   * — le système demande moins de mouvement ;
   * — l'écran est trop étroit. Épingler trois écrans de défilement sur un
   *   téléphone, c'est confisquer la page à quelqu'un qui voulait lire.
   */
  const [still] = useState(
    () => reducedMotion() || (typeof window !== "undefined" && window.innerWidth < 768),
  );

  useEffect(() => {
    const el = root.current;
    if (!el || still) return;

    const ctx = gsap.context(() => {
      const mails = gsap.utils.toArray<SVGElement>("[data-mail]");
      const rows = gsap.utils.toArray<SVGElement>("[data-row]");
      const threads = gsap.utils.toArray<SVGPathElement>("[data-thread]");
      const pipe = el.querySelector<SVGPathElement>("[data-pipe]");

      gsap.set(mails, { opacity: 0, x: -30 });
      gsap.set(rows, { opacity: 0.12 });
      for (const t of threads) {
        const len = t.getTotalLength();
        gsap.set(t, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      }
      if (pipe) {
        const len = pipe.getTotalLength();
        gsap.set(pipe, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
      }

      // L'acte et le compteur se déduisent de la progression, jamais d'un
      // callback : avec « scrub », GSAP saute les callbacks quand on défile
      // vite, et la légende se retrouvait en retard sur l'image.
      const PHASES: [number, number][] = [
        [0, 0.26],     // les commandes arrivent
        [0.26, 0.56],  // la ressaisie
        [0.56, 0.8],   // on câble
        [0.8, 1],      // le temps revient
      ];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: ({ progress: p }) => {
            const i = PHASES.findIndex(([a, b]) => p >= a && p < b);
            setAct(i === -1 ? PHASES.length - 1 : i);

            // 0 pendant l'acte 1, montée jusqu'à 180 pendant l'acte 2,
            // plateau, puis retour à 0 pendant le dernier.
            let m = 0;
            if (p >= 0.26 && p < 0.56) m = ((p - 0.26) / 0.3) * 180;
            else if (p >= 0.56 && p < 0.8) m = 180;
            else if (p >= 0.8) m = 180 * (1 - (p - 0.8) / 0.2);
            setMinutes(Math.max(0, Math.round(m)));
          },
        },
      });

      // Acte 1 — les commandes arrivent.
      tl.to(mails, { opacity: 1, x: 0, duration: 1, stagger: 0.08, ease: "power2.out" });

      // Acte 2 — la ressaisie, un fil par ligne.
      tl.to(threads, { strokeDashoffset: 0, opacity: 0.5, duration: 0.5, stagger: 0.16, ease: "none" }, ">")
        .to(rows, { opacity: 1, duration: 0.35, stagger: 0.16 }, "<");

      // Acte 3 — on câble, une fois. Les fils de la main disparaissent.
      tl.to(threads, { opacity: 0, duration: 0.5 }, ">")
        .to(pipe, { strokeDashoffset: 0, opacity: 1, duration: 1, ease: "power2.inOut" }, "<");

      // Acte 4 — le câble respire, le reste est déjà dit par le compteur.
      tl.to(pipe, { strokeWidth: 8, duration: 0.6, ease: "power1.inOut" }, ">");
    }, el);

    return () => ctx.revert();
  }, [still]);

  // Repli : la même démonstration, en texte, sans une seule animation.
  if (still) {
    return (
      <ol className="rows">
        {ACTS.map((a) => (
          <li key={a.title} className="py-7 first:pt-0">
            <p className="eyebrow eyebrow--accent">{a.kicker}</p>
            <h3 className="display-3 mt-3">{a.title}</h3>
            <p className="mt-2 text-body">{a.note}</p>
          </li>
        ))}
      </ol>
    );
  }

  const current = ACTS[act];

  return (
    <div ref={root} className="relative min-h-[100svh] overflow-hidden">
      <div className="mx-auto grid h-[100svh] max-w-stage items-center gap-10 px-5 md:grid-cols-12 md:px-8">
        {/* Le récit, qui change d'acte en acte */}
        <div className="md:col-span-5">
          <p className="eyebrow eyebrow--accent">{current.kicker}</p>
          <h3 className="display-2 mt-4 min-h-[2.4em] max-w-[16ch]">{current.title}</h3>
          <p className="mt-5 max-w-measure text-body md:min-h-[6em]">{current.note}</p>

          <p className="mt-8 flex items-baseline gap-3">
            <span className="tnum text-5xl font-semibold tracking-[-0.03em] text-brand md:text-6xl">
              {Math.floor(minutes / 60)}h{String(minutes % 60).padStart(2, "0")}
            </span>
            <span className="text-sm text-muted">of retyping, per week</span>
          </p>

          {/* Les quatre temps, pour qu'on sache où on en est */}
          <ol className="mt-8 flex gap-2" aria-hidden>
            {ACTS.map((a, i) => (
              <li
                key={a.kicker}
                className="h-0.5 w-10 rounded-full transition-colors duration-500"
                style={{ background: i <= act ? "var(--brand)" : "var(--line-strong)" }}
              />
            ))}
          </ol>
        </div>

        {/* La scène */}
        <div className="md:col-span-6 md:col-start-7">
          <svg viewBox="0 0 520 420" className="w-full" role="img" aria-label={current.title}>
            {/* La boîte de réception */}
            <text x="8" y="22" className="fill-[var(--muted)]" fontSize="13" letterSpacing="2">
              INBOX
            </text>
            {Array.from({ length: ROWS }).map((_, i) => (
              <g data-mail key={`m${i}`}>
                <rect
                  x="8"
                  y={40 + i * 40}
                  width="150"
                  height="28"
                  rx="5"
                  fill="var(--surface)"
                  stroke="var(--line-strong)"
                />
                <rect x="20" y={50 + i * 40} width="78" height="4" rx="2" fill="var(--brand)" opacity="0.75" />
                <rect x="20" y={58 + i * 40} width="46" height="4" rx="2" fill="var(--muted)" opacity="0.6" />
              </g>
            ))}

            {/* Le tableur */}
            <text x="330" y="22" className="fill-[var(--muted)]" fontSize="13" letterSpacing="2">
              SHEET
            </text>
            <rect
              x="330"
              y="32"
              width="182"
              height={ROWS * 40 + 8}
              rx="6"
              fill="var(--surface)"
              stroke="var(--line-strong)"
            />
            {Array.from({ length: ROWS }).map((_, i) => (
              <g data-row key={`r${i}`}>
                <rect x="342" y={48 + i * 40} width="60" height="5" rx="2.5" fill="var(--brand-soft)" />
                <rect x="412" y={48 + i * 40} width="38" height="5" rx="2.5" fill="var(--muted)" />
                <rect x="460" y={48 + i * 40} width="40" height="5" rx="2.5" fill="var(--muted)" />
                <line
                  x1="342"
                  y1={66 + i * 40}
                  x2="500"
                  y2={66 + i * 40}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Les fils de la ressaisie : un par ligne, tremblants et fins */}
            {Array.from({ length: ROWS }).map((_, i) => (
              <path
                data-thread
                key={`t${i}`}
                d={`M158 ${54 + i * 40} C 230 ${54 + i * 40}, 250 ${51 + i * 40}, 330 ${51 + i * 40}`}
                stroke="var(--muted)"
                strokeWidth="1.5"
                fill="none"
              />
            ))}

            {/* Le câble : un seul trait, épais, en beige */}
            <path
              data-pipe
              d="M158 210 C 215 210, 215 210, 250 210 C 285 210, 285 210, 330 210"
              stroke="var(--brand)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
