import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { PageShell } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "How we run an engagement: sort the data before choosing a tool, produce the file rather than the server, and keep every scope small enough to finish in three weeks.",
};

const STEPS = [
  {
    n: "01",
    title: "Forty-five minutes, and we do not talk about AI",
    body: "We ask what your week looks like, which task makes you sigh, how long it takes, how often, and what happens when it goes wrong. Nothing is installed and nothing is signed. You leave with a written read on what is worth automating and what is not.",
  },
  {
    n: "02",
    title: "Your data, sorted into four categories",
    body: "Public, internal, personal, sensitive. One page, one hour, process by process. This is the step everyone skips and it is the one that decides everything after it: whether your project runs on a European service, on your own machines, or not at all.",
  },
  {
    n: "03",
    title: "One process, scoped to finish",
    body: "We take a single process and we write down what success looks like before we build anything. A scope that cannot be demonstrated in ten minutes is a scope we have not understood yet.",
  },
  {
    n: "04",
    title: "Handover, in writing, to someone who was not in the room",
    body: "Code and accounts in your name, documentation your team can act on, and a clear list of what we did not do. We would rather end an engagement cleanly than hold you by the infrastructure.",
  },
];

const ROUTES = [
  ["Hosted in the EU, under a processing agreement", "The default. Company information, ordinary personal data."],
  ["On your own machines", "Health data, legal files, trade secrets, or a sector rule that forbids the alternative. Hardening is quoted separately."],
  ["No AI at all", "A plain rule does the job, or the data is too sensitive to touch. This is a real outcome, and we have recommended it."],
];

const FILE_ITEMS = [
  "The map of AI tools already in use — there is always undeclared usage, and it is always the first surprise.",
  "The four-category data sort, process by process.",
  "The processing register, which is required whatever your headcount.",
  "Retention periods, including conversation histories and prompt logs. Almost no deployment does this.",
  "The information notice for the people concerned.",
  "The impact assessment where it is required, which in practice is whenever a generative assistant touches staff, patient or identifiable customer data.",
  "The internal usage policy, and user training.",
  "The works-council consultation dossier.",
];

export default function ApproachPage() {
  return (
    <PageShell
      eyebrow="Approach"
      title="The method is the product. The software comes after."
      lede="Most AI projects fail for reasons that have nothing to do with the model: the scope was too wide on day one, nobody measured the value before launch, and no human reviewed a deliverable that committed the company. We work in the opposite order."
    >
      <Reveal as="ol" className="rows" stagger y={24}>
        {STEPS.map((s) => (
          <li key={s.n} className="grid gap-4 py-9 first:pt-0 md:grid-cols-12 md:gap-8">
            <span className="counter md:col-span-1">{s.n}</span>
            <h2 className="display-3 md:col-span-4">{s.title}</h2>
            <p className="text-body md:col-span-6 md:col-start-6">{s.body}</p>
          </li>
        ))}
      </Reveal>

      {/* Le vrai livrable */}
      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-5" y={24}>
          <p className="eyebrow">What companies actually lack</p>
          <h2 className="display-2 mt-4">The file, not the server.</h2>
          <p className="mt-5 text-body">
            Running a model locally answers one question and leaves the rest untouched. It does not give
            you a legal basis, it does not set your retention periods, and it does not consult anyone.
            The file does.
          </p>
        </Reveal>
        <div className="md:col-span-6 md:col-start-7">
          <Reveal as="ul" className="grid gap-3" stagger y={14}>
            {FILE_ITEMS.map((item) => (
              <li key={item} className="grid grid-cols-[auto_1fr] gap-3 text-body">
                <span aria-hidden className="mt-[0.72em] h-0.5 w-4 shrink-0 rounded-full bg-brand" />
                <span>{item}</span>
              </li>
            ))}
          </Reveal>
          <div className="card card--tint lift-on-hover mt-8 p-6">
            <p className="text-body">
              The sentence we repeat in every meeting and every quote:{" "}
              <strong className="text-ink">
                we implement to the rules and we document our choices. Your compliance stays yours and
                your counsel&rsquo;s.
              </strong>{" "}
              We are not lawyers, and we will not pretend to be.
            </p>
          </div>
        </div>
      </section>

      {/* Voie technique */}
      <section className="card card--sand mt-20 p-7 md:p-10">
        <p className="eyebrow">Choosing the technical route</p>
        <h2 className="display-2 mt-4 max-w-[24ch]">
          Local is not a principle. It is one answer out of three.
        </h2>
        <p className="lede mt-6 max-w-measure">
          Running everything on your own hardware sounds safest and is usually the most expensive way to
          be no more compliant. The data sort decides, not the fashion.
        </p>
        <Reveal as="dl" className="rows mt-10" stagger y={18}>
          {ROUTES.map(([route, when]) => (
            <div key={route} className="grid gap-3 py-7 md:grid-cols-12 md:gap-8">
              <dt className="display-3 md:col-span-5">{route}</dt>
              <dd className="text-body md:col-span-6 md:col-start-7">{when}</dd>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Pourquoi les projets échouent */}
      <section className="mt-20 grid gap-10 md:grid-cols-12">
        <Reveal className="md:col-span-5" y={24}>
          <p className="eyebrow">Why pilots fail</p>
          <h2 className="display-2 mt-4">Rarely the model.</h2>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7" stagger y={22}>
          <p className="lede">
            Scope too wide on day one. No measurement of value before launch. Data quality
            underestimated. No human review on a deliverable that commits the company. Substitution
            instead of augmentation. And test environments nobody ever decommissions.
          </p>
          <p className="mt-5">
            That last one is how sixty-four million job applicants&rsquo; records were exposed at a
            large restaurant group in 2025: a test account from 2019, with the password
            &ldquo;123456&rdquo;.
          </p>
          <p className="mt-5">
            One figure is worth keeping. Pilots run by an internal team together with outside help
            succeed about three times as often as pilots carried by an IT department alone. That gap is
            the whole reason we work the way we do.
          </p>
          <Link className="btn btn--quiet underline-grow mt-6 -ml-2" href="/solutions/">
            See what that buys you
          </Link>
        </Reveal>
      </section>
    </PageShell>
  );
}
