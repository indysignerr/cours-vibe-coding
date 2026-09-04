import {
  Award, Bot, Database, Flame, GitBranch, Layers, LockKeyhole, Palette, Rocket,
  Send, Sparkles, Trophy, Wand2, Workflow, type LucideIcon,
} from "lucide-react";

export type Badge = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: "accent" | "done" | "streak" | "xp";
  /** Numéro de séance qui le débloque, s'il y en a un. */
  session?: number;
};

// Un badge par séance, plus quelques badges de comportement. Tout est
// dérivé côté client de ce que l'étudiant a le droit de lire : aucune
// table de badges, donc rien à tricher et rien à administrer.
export const BADGES: Badge[] = [
  { id: "session-1",  session: 1,  label: "First ship",       description: "Your first page on a public URL.",           icon: Rocket,     tone: "accent" },
  { id: "session-2",  session: 2,  label: "Agent whisperer",  description: "Three targeted iterations, zero restarts.",  icon: Bot,        tone: "accent" },
  { id: "session-3",  session: 3,  label: "Undo hero",        description: "A revert that saved you.",                   icon: GitBranch,  tone: "accent" },
  { id: "session-4",  session: 4,  label: "Contender",        description: "You entered the first contest.",            icon: Trophy,     tone: "xp" },
  { id: "session-5",  session: 5,  label: "Architect",        description: "Several pages that hold together.",         icon: Layers,     tone: "accent" },
  { id: "session-6",  session: 6,  label: "Has a face",       description: "It no longer looks like a template.",       icon: Palette,    tone: "accent" },
  { id: "session-7",  session: 7,  label: "Data keeper",      description: "A form that writes into a real database.",  icon: Database,   tone: "accent" },
  { id: "session-8",  session: 8,  label: "Contender II",     description: "You entered the second contest.",           icon: Trophy,     tone: "xp" },
  { id: "session-9",  session: 9,  label: "Gatekeeper",       description: "Working sign-in and row level security.",   icon: LockKeyhole, tone: "accent" },
  { id: "session-10", session: 10, label: "Shipped for real", description: "Custom domain and secrets done right.",     icon: Send,       tone: "accent" },
  { id: "session-11", session: 11, label: "Automator",        description: "A skill and a subagent doing your chores.", icon: Workflow,   tone: "accent" },
  { id: "session-12", session: 12, label: "Demo day",         description: "Presented to a jury in four minutes.",       icon: Sparkles,   tone: "xp" },
  { id: "first-submission", label: "Sent it",      description: "Your first contest submission.",     icon: Send,   tone: "xp" },
  { id: "streak-3",         label: "On a roll",    description: "Three steps completed in a row.",    icon: Flame,  tone: "streak" },
  { id: "streak-6",         label: "Unstoppable",  description: "Six steps completed in a row.",      icon: Flame,  tone: "streak" },
  { id: "all-twelve",       label: "Path complete", description: "Every step of the path, done.",     icon: Award,  tone: "done" },
  { id: "polish",           label: "Polisher",     description: "Every bonus line of a step, ticked.", icon: Wand2, tone: "done" },
];

export const badgeById = (id: string) => BADGES.find((b) => b.id === id);
export const badgeForSession = (n: number) => BADGES.find((b) => b.session === n);
