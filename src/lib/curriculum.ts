// Squelette PUBLIC du programme : numéros, slugs, titres, promesses, dates.
// Il vit dans le repo pour deux raisons : la page programme doit être
// indexable et lisible sans compte, et les routes statiques ont besoin des
// slugs au build. Le CONTENU des séances, lui, vit dans Supabase et reste
// verrouillé par RLS.
export type CurriculumEntry = {
  number: number;
  slug: string;
  title: string;
  promise: string;
  weekOf: string;
  kind: "lesson" | "contest";
};

export const CURRICULUM: CurriculumEntry[] = [
  { number: 1, slug: "ship-something-live", title: "Ship something live", promise: "Your own page, live on a public URL, opened from your phone.", weekOf: "2026-09-14", kind: "lesson" },
  { number: 2, slug: "talk-to-an-agent", title: "Talk to an agent", promise: "The same page, rebuilt in three targeted iterations.", weekOf: "2026-09-21", kind: "lesson" },
  { number: 3, slug: "git-as-a-safety-net", title: "Git as a safety net", promise: "A project with history, and one revert that saves you.", weekOf: "2026-09-28", kind: "lesson" },
  { number: 4, slug: "contest-1", title: "Contest #1", promise: "A landing page built under constraints, submitted before midnight.", weekOf: "2026-10-05", kind: "contest" },
  { number: 5, slug: "structure-a-real-project", title: "Structure a real project", promise: "A Next.js app with several pages that hold together.", weekOf: "2026-10-12", kind: "lesson" },
  { number: 6, slug: "design-not-a-template", title: "Design that is not a template", promise: "The same app, but it finally has a face.", weekOf: "2026-10-19", kind: "lesson" },
  { number: 7, slug: "store-data", title: "Store data", promise: "A form that writes into a real database.", weekOf: "2026-10-26", kind: "lesson" },
  { number: 8, slug: "contest-2", title: "Contest #2", promise: "An app backed by a database, submitted before midnight.", weekOf: "2026-11-02", kind: "contest" },
  { number: 9, slug: "accounts-and-users", title: "Accounts and users", promise: "Working email sign-in on your own app.", weekOf: "2026-11-09", kind: "lesson" },
  { number: 10, slug: "deploy-for-real", title: "Deploy for real", promise: "A custom domain and environment variables, wired properly.", weekOf: "2026-11-16", kind: "lesson" },
  { number: 11, slug: "automate-your-work", title: "Automate your work", promise: "A skill and a subagent doing your chores.", weekOf: "2026-11-23", kind: "lesson" },
  { number: 12, slug: "demo-day", title: "Demo Day", promise: "Your project, presented to a jury, in four minutes.", weekOf: "2026-11-30", kind: "contest" },
];

export const bySlug = (slug: string) => CURRICULUM.find((e) => e.slug === slug);

/** Les cinq sites d'Indy, montrés en preuve sociale sur l'accueil. */
export const PROOF = [
  "nayumatea.com",
  "albert-maths.pages.dev",
  "manika-bkh.pages.dev",
  "indysigner.fr",
  "l-ovive.fr",
];
