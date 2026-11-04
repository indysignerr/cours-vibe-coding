"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { shortDate, upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";

/**
 * Le menu plein écran.
 *
 * C'est l'élément que le jury a distingué chez Cartier — « Homepage &
 * main navigation ». Un menu n'est pas une liste de liens quand il
 * occupe l'écran : il devient la carte du site, et il peut porter ce
 * qu'une barre de navigation ne peut pas — ici les quatre piliers et les
 * trois prochaines dates.
 *
 * Tout est en CSS et en transitions : rien ne tourne pendant qu'il est
 * fermé, donc il ne coûte rien au défilement.
 */
export function Menu() {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const next = upcoming().slice(0, 3);

  /*
   * On ferme au clic, pas depuis un effet sur le chemin.
   * Un effet qui appelle setState en réaction à une navigation fait
   * rendre deux fois pour rien, et React le signale à juste titre ;
   * le clic, lui, est l'endroit où la décision est prise.
   */
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    // Le fond ne défile pas derrière un panneau plein écran.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      // Piège à focus : tant que le menu est ouvert, la tabulation ne
      // doit pas atteindre la page cachée derrière.
      const focusables = panel.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls={id}
        className="tap group flex items-center gap-3 rounded-btn px-3 text-sm font-medium text-ink"
      >
        Menu
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="block h-px w-full bg-ink transition-transform duration-300 group-hover:translate-x-1" />
          <span className="block h-px w-full bg-ink transition-transform delay-75 duration-300 group-hover:translate-x-1" />
        </span>
      </button>

      {/* Le panneau. Toujours monté, décalé hors écran quand il est
          fermé : une transition a besoin d'un état de départ, et un
          montage conditionnel n'en donne pas. */}
      <div
        id={id}
        ref={panel}
        role="dialog"
        aria-modal={open}
        aria-label="Site menu"
        aria-hidden={!open}
        className="on-ink fixed inset-0 z-[70] overflow-y-auto transition-[transform,opacity] duration-500 ease-swift"
        style={{
          transform: open ? "translateY(0)" : "translateY(-100%)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
        }}
      >
        <div className="mx-auto grid min-h-full max-w-stage gap-14 px-5 py-8 md:grid-cols-12 md:px-8 md:py-10">
          <div className="md:col-span-12 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
              className="tap flex items-center gap-3 rounded-btn px-3 text-sm font-medium text-ink"
            >
              Close
              <span aria-hidden className="relative block size-4">
                <span className="absolute left-0 top-1/2 block h-px w-4 rotate-45 bg-ink" />
                <span className="absolute left-0 top-1/2 block h-px w-4 -rotate-45 bg-ink" />
              </span>
            </button>
          </div>

          {/* Les piliers, qui sont la vraie carte du site. */}
          <nav aria-label="Sections" className="md:col-span-7">
            <p className="eyebrow eyebrow--accent">What we do</p>
            <ul className="mt-7 grid gap-1">
              {PILLARS.map((p) => (
                <li key={p.key}>
                  <Link
                    href={`/#${p.key}`}
                    onClick={close}
                    className="group flex items-baseline gap-5 py-3"
                  >
                    <span className="display-1 transition-colors group-hover:text-accent">
                      {p.title}
                    </span>
                    <span className="hidden text-sm text-muted sm:block">{p.verb}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <ul className="mt-12 flex flex-wrap gap-x-7 gap-y-3">
              {[
                ["/events/", "All events"],
                ["/join/", "Join"],
                ["/about/", "About"],
                ["/contact/", "Contact"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link className="underline-grow text-body hover:text-accent" href={href} onClick={close}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Les trois prochaines dates : un menu qui informe. */}
          <div className="md:col-span-4 md:col-start-9">
            <p className="eyebrow eyebrow--accent">Next up</p>
            <ul className="rows mt-7">
              {next.map((e) => (
                <li key={e.slug}>
                  <Link href="/events/" onClick={close} className="group block py-4">
                    <span className="tnum block text-sm text-accent">{shortDate(e.date)}</span>
                    <span className="display-3 mt-1.5 block transition-colors group-hover:text-accent">
                      {e.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{e.format}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
