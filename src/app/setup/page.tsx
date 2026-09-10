import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Setup",
  description: "Do this before the first session. Twenty minutes at home, so nobody loses the hour to installations.",
};

type Step = { title: string; body: string; command?: string; expect?: string };

const STEPS: Step[] = [
  {
    title: "Get a Claude account that can run Claude Code",
    body: "Claude Code does not work on the free plan. You need Claude Pro, or an API key with credits. No budget for it? Tell us before 14 September: the club has a shared key for the room, and we give it to you at the door.",
  },
  {
    title: "Install Claude Code",
    body: "It is the version of Claude that lives in your terminal and can actually edit files. Follow the official installer for your operating system, then start it once to log in.",
    command: "claude",
    expect: "It asks you to log in the first time, then shows a prompt with a > sign. Type /exit to leave.",
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
    title: "Make one folder, and learn to open a terminal inside it",
    body: "Everything you build in this club lives here. Mac: open Terminal, type cd followed by a space, drag the folder into the window, press Enter. Windows: open the folder in Explorer, click the address bar, type cmd, press Enter. You will do this at the start of every session.",
    command: "mkdir -p ~/albert-vibecoding",
  },
];

const BEFORE_S03: Step[] = [
  {
    title: "Install git and the GitHub tool",
    body: "Mac: type git in Terminal and accept the install it offers, then install gh with Homebrew. Windows: install Git for Windows and GitHub CLI from their sites.",
    command: "git --version && gh --version",
    expect: "Two version numbers.",
  },
  {
    title: "Tell git who you are",
    body: "Once, on your machine. Use the same email as your GitHub account.",
    command: "git config --global user.name \"Your Name\" && git config --global user.email \"you@example.com\" && git config --global init.defaultBranch main",
  },
  {
    title: "Connect your laptop to GitHub",
    body: "This opens your browser once. After that, pushing code never asks again.",
    command: "gh auth login",
    expect: "gh auth status says you are logged in.",
  },
];

function Steps({ steps, offset = 0 }: { steps: Step[]; offset?: number }) {
  return (
    <ol className="grid gap-4">
      {steps.map((step, i) => (
        <li key={step.title} className="card-3d min-w-0 p-6 md:p-8">
          <div className="flex items-baseline gap-4">
            <span className="font-mono font-bold tabular-nums text-accent-strong">{String(i + 1 + offset).padStart(2, "0")}</span>
            <h3 className="font-display text-2xl font-extrabold">{step.title}</h3>
          </div>
          <p className="mt-3 max-w-measure text-muted">{step.body}</p>
          {step.command ? (
            <pre className="code-block mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words px-5 py-4 font-mono text-xl">
              <code>{step.command}</code>
            </pre>
          ) : null}
          {step.expect ? (
            <p className="mt-3 max-w-measure text-muted">
              <strong className="font-bold text-ink">Expected:</strong> {step.expect}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export default function SetupPage() {
  return (
    <PageShell
      eyebrow="Before session 01"
      title="Twenty minutes at home, so we never lose the hour."
      lede="The fastest way to kill a club like this is to spend the first two sessions installing things. Do these seven steps before you come. If one of them fights back, come ten minutes early and we fix it together."
    >
      <Steps steps={STEPS} />

      <section aria-labelledby="before-s03" className="mt-16">
        <p className="eyebrow text-accent-strong">Before step 03 · week of 28 September</p>
        <h2 id="before-s03" className="mt-3 font-display text-display-md font-extrabold">Three more, the week before git</h2>
        <p className="mt-3 max-w-measure text-muted">
          Step 03 puts your project on GitHub. These three need a browser and a password, so they happen at home, not in the room.
        </p>
        <div className="mt-8">
          <Steps steps={BEFORE_S03} offset={7} />
        </div>
      </section>

      <div className="card-3d mt-12 p-6 md:p-8">
        <h2 className="font-display text-2xl font-extrabold">If you get stuck</h2>
        <p className="mt-3 max-w-measure text-muted">
          Do not spend an evening on it. Post the exact error text in the club group, and someone answers.
          An error message pasted in full gets fixed in two minutes. The words &ldquo;it does not work&rdquo; get fixed in twenty.
        </p>
      </div>
    </PageShell>
  );
}
