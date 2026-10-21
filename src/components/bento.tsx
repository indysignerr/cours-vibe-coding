"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * La grille bento des principes.
 *
 * Structure reprise de « bento grid 01 » (avanishverma4, 21st.dev) : une
 * grille de six colonnes en lignes de hauteur fixe, où chaque tuile choisit
 * sa portée. L'idée qu'on lui emprunte vraiment est que chaque tuile
 * contient une petite animation qui *montre* le principe au lieu de l'écrire.
 * La peau, le contenu et les animations sont à nous.
 */

/**
 * Les quatre catégories, en pile.
 *
 * Verticale et non en ligne : la tuile fait deux rangées de haut, et quatre
 * pastilles centrées y laissaient un trou au-dessus et au-dessous. Empilées,
 * elles remplissent la hauteur et donnent à voir ce qu'est un tri.
 */
function DataSort() {
  const cats = [
    { name: "Public", note: "Anywhere" },
    { name: "Internal", note: "EU, under contract" },
    { name: "Personal", note: "EU, logged" },
    { name: "Sensitive", note: "Your machines, or not at all" },
  ];
  const [on, setOn] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setOn((p) => (p + 1) % cats.length), 1500);
    return () => clearInterval(i);
  }, [cats.length]);

  return (
    /*
     * Les pastilles remplissent la hauteur au lieu de s'écarter.
     * La tuile s'étire pour suivre la colonne de droite, et un
     * justify-between laissait alors 36 px entre chaque pastille — le
     * groupe se défaisait. flex-1 les fait grandir ensemble, et le
     * plafond évite quatre bandes démesurées sur un très grand écran.
     */
    <ul className="flex h-full flex-col justify-center gap-2.5">
      {cats.map((c, i) => (
        <motion.li
          key={c.name}
          className="flex max-h-[5.5rem] flex-1 items-center justify-between gap-3 rounded-btn px-3.5 py-2.5"
          animate={{
            backgroundColor: i === on ? "var(--brand)" : "var(--sunken)",
            color: i === on ? "var(--on-brand)" : "var(--muted)",
          }}
          transition={{ duration: 0.45 }}
        >
          <span className="font-medium">{c.name}</span>
          <motion.span
            className="text-right text-xs"
            animate={{ opacity: i === on ? 0.75 : 0.45 }}
            transition={{ duration: 0.45 }}
          >
            {c.note}
          </motion.span>
        </motion.li>
      ))}
    </ul>
  );
}

/** L'interrupteur qui finit sur « non ». */
function SometimesNo() {
  const [yes, setYes] = useState(true);
  useEffect(() => {
    const i = setInterval(() => setYes((p) => !p), 2200);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex h-full items-center gap-4">
      <motion.span
        className="flex h-9 w-16 items-center rounded-full p-1"
        animate={{ backgroundColor: yes ? "var(--brand)" : "var(--line-strong)" }}
        transition={{ duration: 0.4 }}
      >
        <motion.span
          className="size-7 rounded-full bg-canvas"
          animate={{ x: yes ? 28 : 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
        />
      </motion.span>
      <motion.span
        key={yes ? "y" : "n"}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold tracking-[-0.02em] text-ink"
      >
        {yes ? "Automate it" : "Leave it alone"}
      </motion.span>
    </div>
  );
}

/**
 * Le tampon qui n'arrive jamais sur le papier.
 *
 * La barre va d'angle à angle : bas gauche vers haut droit. Un trait en
 * CSS ne peut pas faire ça tout seul — il faudrait connaître l'arc
 * tangente du rapport du badge, qui change avec la longueur du mot et la
 * taille du texte.
 *
 * D'où le SVG : la viewBox 0 0 100 100 est étirée aux dimensions réelles
 * par preserveAspectRatio="none", donc la diagonale tombe pile sur les
 * deux angles quelles que soient les proportions. vector-effect garde
 * l'épaisseur du trait constante, sinon l'étirement non uniforme
 * l'écraserait dans un sens et l'épaissirait dans l'autre.
 */
function NeverCertify() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="relative inline-block">
        <span className="block rounded-card px-6 py-4 text-center text-sm uppercase tracking-[0.18em] text-muted shadow-[inset_0_0_0_1px_var(--line-strong)]">
          Certified
        </span>
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <motion.line
            x1="0"
            y1="100"
            x2="100"
            y2="0"
            stroke="var(--brand)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      </span>
    </div>
  );
}

const TILES = [
  {
    span: "md:col-span-2 md:row-span-2",
    title: "We sort your data before we choose a tool",
    body: "Four categories, one page, one hour. The answer decides everything after it.",
    visual: <DataSort />,
  },
  {
    span: "md:col-span-4",
    title: "Sometimes the honest answer is no AI",
    body: "A plain rule is often better. Saying so is what separates an advisor from a vendor.",
    visual: <SometimesNo />,
  },
  {
    span: "md:col-span-2",
    title: "We implement, we never certify",
    body: "Your compliance stays yours and your counsel’s.",
    visual: <NeverCertify />,
  },
  {
    span: "md:col-span-2",
    title: "Fixed price, or no price",
    body: "A fixed price caps the risk on both sides. We have never billed by the day.",
    visual: (
      <p className="flex h-full items-center text-5xl font-semibold tracking-[-0.03em] text-brand">
        €2,500
      </p>
    ),
  },
];

export function Bento() {
  return (
    <div className="grid auto-rows-[minmax(176px,auto)] grid-cols-1 gap-4 md:grid-cols-6">
      {TILES.map((t, i) => (
        <motion.article
          key={t.title}
          className={`card flex flex-col justify-between overflow-hidden p-7 ${t.span}`}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
        >
          <div className="min-h-[72px] flex-1">{t.visual}</div>
          <div className="mt-7">
            <h3 className="display-3">{t.title}</h3>
            <p className="mt-2 text-sm text-body">{t.body}</p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
