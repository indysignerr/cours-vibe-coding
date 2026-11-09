import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { PageHead, Shell } from "@/components/shell";
import { shortDate, upcoming } from "@/lib/events";
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
 * Ce que le plan dit tient en trois faits : le formulaire d'inscription
 * porte la question « join Albert LIGHT », un QR code permet de rejoindre
 * sur place, et les débutants sont bienvenus.
 */
export default function JoinPage() {
  const [first] = upcoming();

  return (
    <Shell>
      <PageHead
        eyebrow={`For students at ${SITE.school} ${SITE.campus}`}
        title="Come once. Stay if it is useful."
        lede="Beginners welcome. Open events need nothing but a sign-up; membership is a question on that same form."
      />

      <section>
        <h2>Two ways in</h2>
        <ol className="rows mt-3">
          <li className="py-4">
            <h3>1. Sign up for an event</h3>
            <p className="mt-1 max-w-[60ch]">
              The form asks whether you want to join Albert L.I.G.H.T. Tick it,
              and you are a member.
            </p>
          </li>
          <li className="py-4">
            <h3>2. Or scan the code on the day</h3>
            <p className="mt-1 max-w-[60ch]">
              There is a QR code at every event for joining on the spot.
            </p>
          </li>
        </ol>
      </section>

      <section className="mt-12">
        <h2>What membership opens</h2>
        <p className="mt-3 max-w-[60ch]">
          Vibe coding tournaments, Build Lab and the crash courses. Workshops
          and the big open events are open to anyone at {SITE.school}, member or
          not.
        </p>
      </section>

      {first ? (
        <section className="mt-12">
          <h2>Next up</h2>
          <p className="mt-3">
            <time className="text-sm text-muted" dateTime={first.date}>
              {shortDate(first.date)}
            </time>{" "}
            · {first.title}
          </p>
          <p className="mt-1 max-w-[60ch]">{first.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link className="btn btn--primary" href={`/events/${first.slug}/`}>
              Sign up
            </Link>
            <AddToCalendar event={first} variant="ghost" label="Add the date" />
          </div>
        </section>
      ) : null}
    </Shell>
  );
}
