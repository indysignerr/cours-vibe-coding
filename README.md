# Vibe Coding Club — site du cours

> Le nom est provisoire. Il se change dans `src/lib/site.ts`, et la peau
> dans le bloc `:root` de `src/app/globals.css`.

Site de l'association vibecoding d'Albert School. Une heure par semaine,
douze semaines, trois concours. Le site sert à la fois de support projeté
en séance et de plateforme de rendu des projets.

## Stack

- Next.js 16 App Router, TypeScript, export statique
- Tailwind 3 avec `tailwindcss-animate`, tokens en variables CSS
- Supabase pour le contenu de cours, les rendus et la notation
- Lenis pour le scroll, Framer Motion et GSAP pour les animations
- Hébergement Cloudflare Pages. Jamais Vercel.

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir les deux valeurs Supabase
npm run dev
```

## Base de données

```bash
# dans le SQL editor Supabase, dans cet ordre
supabase/schema.sql
supabase/seed.sql
```

Le schéma est en anglais côté contenu et en français côté commentaires.
Les politiques RLS sont le verrou des séances : une séance dont
`is_unlocked` est faux ne quitte jamais la base. Voir `ARCHITECTURE.md`.

## Déploiement

Cloudflare Pages, build command `npm run build`, output directory `out`,
`NODE_VERSION` à `20` ou plus. Les deux variables `NEXT_PUBLIC_SUPABASE_*`
sont à déclarer côté Pages. Elles sont publiques par nature.

## Documents

- `ARCHITECTURE.md` — les décisions et l'arbitrage verrou au build contre RLS
- `RUBRIC.md` — la grille de notation publiée aux étudiants
