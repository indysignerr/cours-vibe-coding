import type { Metadata } from "next";
import Link from "next/link";
import { AddToCalendar } from "@/components/add-to-calendar";
import { Stage } from "@/components/stage";
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

/** Ce que l'adhésion ouvre, dans les mots du plan. */
const MEMBERS_ONLY = ["Vibe coding tournaments", "Build Lab", "Crash courses"];

/**
 * Comment on entre : deux portes, un écran.
 *
 * Ce que le plan dit tient en trois faits : le formulaire d'inscription
 * à un évènement porte la question « join Albert LIGHT », un QR code
 * permet de rejoindre sur place le jour même, et les débutants sont
 * bienvenus. Rien d'autre n'est décidé, donc rien d'autre n'est écrit.
 */
export default function JoinPage() {
  const [first] = upcoming();

  return (
    <Stage className="stage--join">
      <header className="max-w-[40rem]">
        <p className="eyebrow eyebrow--accent rise">
          For students at {SITE.school} {SITE.campus}
        </p>
        <h1 className="display-1 rise mt-4 [animation-delay:80ms]">
          Come once. Stay if it is useful.
        </h1>
        <p className="lede rise mt-5 [animation-delay:160ms]">
          Beginners welcome. Open events need nothing but a sign-up —
          membership is one question on that same form.
        </p>
      </header>

      <ol className="ways mt-auto" aria-label="Two ways in">
        <li className="way rise [animation-delay:260ms]">
          <span className="way__n tnum">01</span>
          <h2 className="display-2 mt-3">Sign up for an event</h2>
          <p className="mt-3 text-body">
            The form asks whether you want to join Albert L.I.G.H.T. Tick it,
            and you are a member.
          </p>
          {first ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link className="btn btn--primary" href={`/events/${first.slug}/`}>
                {first.title} · {shortDate(first.date)}
              </Link>
              <AddToCalendar event={first} variant="outline" label="Add the date" />
            </div>
          ) : null}
        </li>
        <li className="way rise [animation-delay:360ms]">
          <span className="way__n tnum">02</span>
          <h2 className="display-2 mt-3">Or scan the code on the day</h2>
          <p className="mt-3 text-body">
            There is a QR code at every event for joining on the spot.
          </p>
          <p className="mt-5 eyebrow">Membership opens</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {MEMBERS_ONLY.map((name) => (
              <li key={name}>
                <Link className="tag tag--link" href="/events/">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            Workshops and the big open events are open to anyone at{" "}
            {SITE.school}, member or not.
          </p>
        </li>
      </ol>
    </Stage>
  );
}
