"use client";

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
                className="group flex w-full items-start gap-5 py-8 text-left"
              >
                <span className="counter shrink-0">{o.n}</span>

                <span className="flex-1">
                  <span className="display-2 block transition-colors group-hover:text-accent">
                    {o.title}
                  </span>
                  <span className="mt-2 block text-sm text-muted">{o.duration}</span>

                  {/* Les trois points, lus sans déplier. */}
                  <span className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                    {o.keyPoints.map((k) => (
                      <span key={k} className="flex items-center gap-2 text-sm text-body">
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />
                        {k}
                      </span>
                    ))}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="tnum block text-2xl font-semibold tracking-[-0.02em] text-ink">
                    {o.price}
                  </span>
                  <span className="mt-2 block text-sm text-accent underline-grow">
                    {isOpen ? "Close" : "Learn more"}
                  </span>
                </span>
              </button>
            </h2>

            {/*
              Le dépliage se fait par grid-template-rows, de 0fr à 1fr.
              Pas d'AnimatePresence : il garde l'enfant sortant monté le
              temps de l'animation, et React 19 levait « removeChild : the
              node to be removed is not a child of this node » en tombant
              sur un nœud qu'il croyait déjà parti. Le panneau reste ici
              toujours monté — simplement replié à zéro — donc React garde
              la main sur son arbre et la hauteur s'anime sans être mesurée.
            */}
            <div
              id={`offer-${o.slug}`}
              className="grid transition-[grid-template-rows,opacity] duration-500 ease-swift motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
              aria-hidden={!isOpen}
            >
              <div className="overflow-hidden">
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
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
