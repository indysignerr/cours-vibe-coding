import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { CURRICULUM, bySlug } from "@/lib/curriculum";
import { SessionView } from "./session-view";

// Les slugs sont publics, le contenu ne l'est pas. On génère donc les douze
// routes au build, et la RLS décide ensuite ce que chacune montre.
export function generateStaticParams() {
  return CURRICULUM.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = bySlug(slug);
  return {
    title: entry ? entry.title : "Session",
    robots: { index: false, follow: false },
  };
}

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = bySlug(slug);
  if (!entry) notFound();

  return (
    <PageShell
      eyebrow={`Session ${String(entry.number).padStart(2, "0")}`}
      title={entry.title}
    >
      <SessionView slug={slug} />
    </PageShell>
  );
}
