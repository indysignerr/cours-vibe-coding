import type { Metadata } from "next";
import { HomeScene } from "@/components/home-scene";
import { Stage } from "@/components/stage";
import { upcoming } from "@/lib/events";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: `${SITE.name} — Albert School's student lab for AI and code`,
  },
  description:
    "Albert School's student lab for AI and code, in Milan. Workshops, crash courses, Build Lab and vibe coding tournaments, at least every two weeks. Free.",
};

/**
 * L'accueil tient en un écran. Le détail est dans home-scene.tsx ; ici
 * on ne fait que lui donner la prochaine date, calculée au build.
 */
export default function Home() {
  const [next] = upcoming();

  return (
    <Stage className="stage--scene">
      <HomeScene next={next} />
    </Stage>
  );
}
