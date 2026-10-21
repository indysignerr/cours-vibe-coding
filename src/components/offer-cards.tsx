"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { OFFERS } from "@/lib/offers";

/**
 * Les cinq offres, repliées.
 *
 * Le texte n'a pas disparu, il est rangé : on voit cinq lignes et un prix,
 * et le détail sort au clic. C'est aussi la bonne façon de lire une offre —
 * on compare d'abord, on approfondit ensuite.
 *
 * Construit sur un bouton et une région, pas sur <details> : il faut pouvoir
 * animer la hauteur et n'en garder qu'une ouverte à la fois.
 */
export function OfferCards() {
  const [open, setOpen] = useState<string | null>(OFFERS[0]?.slug ?? null);

  return (
    <ul className="rows">
      {OFFERS.map((o) => {
        const isOpen = open === o.slug;
        return (
          <li key={o.slug}>
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`offer-${o.slug}`}
                onClick={() => setOpen(isOpen ? null : o.slug)}
                className="group flex w-full items-baseline gap-5 py-7 text-left"
              >
                <span className="counter shrink-0">{o.n}</span>

                <span className="flex-1">
                  <span className="display-2 block transition-colors group-hover:text-brand">
                    {o.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted">{o.duration}</span>
                </span>

                <span className="tnum shrink-0 text-xl font-semibold tracking-[-0.02em] text-ink">
                  {o.price}
                </span>

                {/* Le signe qui bascule en croix */}
                <span aria-hidden className="relative ml-2 size-5 shrink-0">
                  <motion.span
                    className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-brand"
                  />
                  <motion.span
                    className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded-full bg-brand"
                    animate={{ rotate: isOpen ? 0 : 90 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </button>
            </h2>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={`offer-${o.slug}`}
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-8 pb-10 md:grid-cols-12">
                    <div className="md:col-span-5">
                      <p className="lede">{o.summary}</p>
                      {o.market ? (
                        <p className="mt-5 inline-block rounded-btn bg-accent-tint px-3 py-1 text-sm font-medium text-accent">
                          {o.market}
                        </p>
                      ) : null}
                    </div>

                    <div className="md:col-span-7">
                      <p className="eyebrow">What you receive</p>
                      <ul className="mt-4 grid gap-2.5">
                        {o.delivers.map((d) => (
                          <li key={d} className="grid grid-cols-[auto_1fr] gap-3 text-body">
                            <span
                              aria-hidden
                              className="mt-[0.72em] h-0.5 w-4 shrink-0 rounded-full bg-brand"
                            />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>

                      <p className="eyebrow mt-8">Not included</p>
                      <p className="mt-3 text-body">{o.excludes}</p>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
