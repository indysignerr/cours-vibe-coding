import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Setup",
  description:
    "Do this before the first session. Twenty minutes at home, so nobody loses the hour to installations.",
};

type Step = { title: string; body: string; command?: string; expect?: string };

const STEPS: Step[] = [
  {
    title: "Create a Claude account",
    body: "Go to claude.ai and sign up. This is the agent you will be working with for twelve weeks.",
  },
  {
    title: "Install Claude Code",
    body: "It is the version of Claude that lives in your terminal and can actually edit files. Follow the official installer for your operating system, then check it answers.",
    command: "claude --version",
    expect: "A version number. If the command is not found, the install did not finish.",
  },
  {
    title: "Install Node.js",
    body: "Download the LTS version from nodejs.org. This is what runs the websites you will build, on your own machine.",
    command: "node -v",
    expect: "Something starting with v20 or higher.",
  },
  {
    title: "Create a GitHub account",
    body: "Pick a username you would be happy to show a recruiter, because it becomes a public part of your portfolio. Avoid nicknames you will regret.",
  },
  {
    title: "Create a Cloudflare account",
    body: "This is where your sites will be hosted, for free, on real public URLs.",
  },
  {
    title: "Install VS Code",
    body: "The editor. You will not type much code in it, but you need to see what the agent is doing.",
  },
  {
    title: "Make one folder",
    body: "Everything you build in this club lives here. One folder, so nothing gets lost.",
    command: "mkdir -p ~/albert-vibecoding",
  },
];

export default function SetupPage() {
  return (
    <PageShell
      eyebrow="Before session 01"
      title="Twenty minutes at home, so we never lose the hour."
      lede="The fastest way to kill a club like this is to spend the first two sessions installing things. Do these seven steps before you come. If one of them fights back, come ten minutes early and we fix it together."
    >
      <ol className="grid gap-4">
        {STEPS.map((step, i) => (
          <li key={step.title} className="card-3d min-w-0 p-6 md:p-8">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-sm text-accent-strong tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-display text-2xl font-extrabold">{step.title}</h2>
            </div>

            <p className="mt-3 max-w-measure text-base text-muted">{step.body}</p>

            {step.command ? (
              <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-2xl bg-ink px-5 py-4 font-mono text-xl text-paper">
                <code>{step.command}</code>
              </pre>
            ) : null}

            {step.expect ? (
              <p className="mt-3 max-w-measure text-sm text-muted">
                <strong className="font-semibold text-ink">Expected:</strong> {step.expect}
              </p>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-12 card-3d p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">If you get stuck</h2>
        <p className="mt-3 max-w-measure text-base text-muted">
          Do not spend an evening on it. Post the exact error text in the club group, and someone
          answers. An error message pasted in full gets fixed in two minutes. The words &ldquo;it
          does not work&rdquo; get fixed in twenty.
        </p>
      </div>
    </PageShell>
  );
}
