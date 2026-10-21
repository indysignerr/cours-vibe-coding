import type { Metadata } from "next";
import Link from "next/link";
import { AccountForm } from "@/components/account-form";
import { AddToCalendar } from "@/components/add-to-calendar";
import { PageShell } from "@/components/page-shell";
import { peerHour } from "@/lib/calendar";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create an account",
  description: `Create your ${SITE.name} account with the invite code an organiser sent you, then start the setup module.`,
  robots: { index: false, follow: true },
};

const AFTER = [
  {
    n: "01",
    title: "The setup module, about forty minutes",
    body: "You leave with a working environment: an editor, an agent, a GitHub account, and one page already live on the internet. Most people never get that far on their own.",
  },
  {
    n: "02",
    title: "The path opens, one module at a time",
    body: `${SITE.weeks} modules. Each one unlocks when the one before it is finished. There is no attendance and nobody will chase you.`,
  },
  {
    n: "03",
    title: "The weekly hour is in your calendar",
    body: `${SITE.weekly.day}s, ${SITE.weekly.start} to ${SITE.weekly.end}. You bring what is blocking you; someone who already cleared it shows you how.`,
  },
];

export default function SignUpPage() {
  return (
    <PageShell
      eyebrow={`For students at ${SITE.school} ${SITE.campus}`}
      title="Create your account."
      lede="Places are handed out by hand, so you need an invite code from a member. Everything else takes two minutes."
    >
      <div className="grid gap-16 md:grid-cols-12">
        <section className="md:col-span-6">
          <AccountForm defaultMode="signup" />

          <div className="card card--sand mt-10 p-6">
            <p className="eyebrow">No invite code?</p>
            <p className="mt-3 text-body">
              Ask any member, or come to the weekly hour and leave with one. We would rather meet you
              first than hand out codes to a form.
            </p>
            <div className="mt-5">
              <AddToCalendar event={peerHour()} label="Add the weekly hour" />
            </div>
          </div>

          <p className="mt-8 max-w-measure text-sm text-muted">
            Your email and your password are stored by our database provider. We never see your
            password. What the association keeps, and for how long, is set out in the{" "}
            <Link className="text-accent underline underline-offset-4" href="/privacy/">
              privacy notice
            </Link>
            .
          </p>
        </section>

        <section className="md:col-span-5 md:col-start-8">
          <p className="eyebrow">What happens next</p>
          <ol className="rows mt-8">
            {AFTER.map((a) => (
              <li key={a.n} className="py-7 first:pt-0">
                <span className="counter">{a.n}</span>
                <h2 className="display-3 mt-3">{a.title}</h2>
                <p className="mt-2.5 text-body">{a.body}</p>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link className="btn btn--ghost" href="/programme/">
              See the whole path
            </Link>
            <Link className="btn btn--quiet" href="/join/">
              What the association asks of you
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
