import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { PageShell } from "@/components/page-shell";
import { upcoming } from "@/lib/events";
import { PILLARS } from "@/lib/pillars";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Join us",
  description: `For students at ${SITE.school} ${SITE.campus}: how to come to an event, and how you become a member.`,
  openGraph: {
    images: [
      {
        url: "/og/join.png",
        width: 1200,
        height: 630,
        alt: "Come once. Stay if it is useful",
      },
    ],
  },
};

/**
 * Comment on entre.
 *
 * Ce que le plan dit tient en trois faits : le formulaire d'inscription
 * à un évènement porte la question « join Albert LIGHT », un QR code
 * permet de rejoindre sur place le jour même, et les débutants sont
 * bienvenus. La version précédente de cette page déroulait quatre
 * étapes et une liste de matériel à apporter : rien de tout cela
 * n'était décidé.
 */
export default function JoinPage() {
  const next = upcoming();
  const first = next[0];
  const membersOnly = PILLARS.flatMap((p) => p.formats)
    .map((f) => f.name)
    .filter(
      (n) =>
        n === "Crash course" ||
        n === "Build Lab" ||
        n === "Vibe coding tournament",
    );

  return (
    <PageShell
      eyebrow={`For students at ${SITE.school} ${SITE.campus}`}
      title="Come once. Stay if it is useful."
      lede="Beginners welcome. Open events need nothing but a sign-up; membership is a question on that same form."
    >
      <section className="scroll-in">
        <p className="eyebrow">Two ways in</p>
        <ol className="rows mt-6">
          <li className="grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-6">
            <span className="counter md:col-span-1">01</span>
            <span className="display-3 md:col-span-4">
              Sign up for an event
            </span>
            <span className="text-body md:col-span-7">
              The form asks whether you want to join Albert L.I.G.H.T. Tick it,
              and you are a member.
            </span>
          </li>
          <li className="grid gap-2 py-6 md:grid-cols-12 md:items-baseline md:gap-6">
            <span className="counter md:col-span-1">02</span>
            <span className="display-3 md:col-span-4">
              Or scan the code on the day
            </span>
            <span className="text-body md:col-span-7">
              There is a QR code at every event for joining on the spot.
            </span>
          </li>
        </ol>
      </section>

      <section className="mt-20 scroll-in">
        <p className="eyebrow">What membership opens</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {membersOnly.map((name) => (
            <li key={name}>
              <Link className="tag tag--link" href="/events/">
                {name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-measure text-body">
          Workshops and the big open events are open to anyone at {SITE.school},
          member or not.
        </p>
      </section>

      {first ? (
        <section className="mt-20 grid gap-10 md:grid-cols-12 scroll-in">
          <div className="md:col-span-5">
            <p className="eyebrow eyebrow--accent">Next up</p>
            <h2 className="display-2 mt-4">{first.title}</h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="lede">{first.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="btn btn--primary"
                href={`/events/#${first.slug}`}
              >
                Sign up
              </Link>
              <AddToCalendar
                event={first}
                variant="outline"
                label="Add the date"
              />
            </div>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
