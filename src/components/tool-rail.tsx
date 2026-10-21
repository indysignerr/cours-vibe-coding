import { Reveal } from "@/components/motion/reveal";

/**
 * Les outils, nommés.
 *
 * Pas de logos : le site déclare ne pas être affilié à ces éditeurs, et
 * aligner leurs marques dirait le contraire. Un nom et ce qu'il sert à
 * faire en dit plus à un dirigeant qu'une rangée de pictogrammes.
 */
const TOOLS = [
  { name: "Claude Code", role: "Writes and ships the software" },
  { name: "Make", role: "Links tools that were never meant to talk" },
  { name: "n8n", role: "Runs the workflows, on your own instance" },
  { name: "lemlist", role: "Handles the outbound nobody wants to do by hand" },
];

export function ToolRail() {
  return (
    <Reveal as="ul" className="grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-4" stagger y={20}>
      {TOOLS.map((t) => (
        <li key={t.name} className="group bg-surface p-6 transition-colors hover:bg-sunken">
          <span aria-hidden className="block h-0.5 w-6 rounded-full bg-brand transition-all duration-500 group-hover:w-12" />
          <p className="display-3 mt-5">{t.name}</p>
          <p className="mt-2 text-sm text-muted">{t.role}</p>
        </li>
      ))}
    </Reveal>
  );
}
