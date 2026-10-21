import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Before you come",
  description:
    "Twenty minutes at home before a hackathon or a workshop, so the room is spent building rather than installing.",
};

type Step = { title: string; body: string; command?: string; expect?: string };

const STEPS: Step[] = [
  {
    title: "Check which subscription you picked",
    body: "Albert School already requires a paid ChatGPT or Claude subscription, so you are probably covered. One catch, and it is the only thing in this club that costs money: Claude Code runs on a Claude plan only. If you picked ChatGPT for school, you need Claude Pro on top, or an API key with credits. The association does not provide a shared key.",
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
    body: "Everything you build with us lives here. Mac: open Terminal, type cd followed by a space, drag the folder into the window, press Enter. Windows: open the folder in Explorer, click the address bar, type cmd, press Enter. You will do this at the start of every event.",
    command: "mkdir -p ~/albert-light",
  },
];

const BEFORE_HACKATHON: Step[] = [
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
    <Reveal as="ol" className="grid gap-4" stagger y={22}>
      {steps.map((step, i) => (
        <li key={step.title} className="card lift-on-hover min-w-0 p-6 md:p-8">
          <div className="flex items-baseline gap-4">
            <span className="counter">{String(i + 1 + offset).padStart(2, "0")}</span>
            <h2 className="display-3">{step.title}</h2>
          </div>
          <p className="mt-3 max-w-measure text-body">{step.body}</p>
          {step.command ? (
            <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-card bg-ink-surface px-5 py-4 text-lg text-on-ink">
              <code>{step.command}</code>
            </pre>
          ) : null}
          {step.expect ? (
            <p className="mt-3 max-w-measure text-muted">
              <strong className="text-ink">Expected:</strong> {step.expect}
            </p>
          ) : null}
        </li>
      ))}
    </Reveal>
  );
}

export default function SetupPage() {
  return (
    <PageShell
      eyebrow="Before you come"
      title="Twenty minutes at home, so the room is spent building."
      lede="The fastest way to waste a hackathon is to spend its first three hours installing things. Do these seven steps before you turn up. If one of them fights back, come ten minutes early and we fix it together."
    >
      <Steps steps={STEPS} />

      <section aria-labelledby="before-hackathon" className="mt-16">
        <p className="eyebrow eyebrow--accent">Three more, before a hackathon</p>
        <h2 id="before-hackathon" className="display-2 mt-3">
          Only if you are coming to build
        </h2>
        <p className="mt-3 max-w-measure text-body">
          A hackathon ends with your work on a public URL, which means pushing code. These three need a
          browser and a password, so they happen at home, not in the room. A workshop or a talk does not
          need them.
        </p>
        <div className="mt-8">
          <Steps steps={BEFORE_HACKATHON} offset={7} />
        </div>
      </section>

      <div className="card card--sand mt-12 p-6 md:p-8">
        <h2 className="display-3">If you get stuck</h2>
        <p className="mt-3 max-w-measure text-body">
          Do not spend an evening on it. Send the exact error text to the association group and someone
          answers. An error message pasted in full gets fixed in two minutes. The words &ldquo;it does
          not work&rdquo; get fixed in twenty.
        </p>
      </div>
    </PageShell>
  );
}
