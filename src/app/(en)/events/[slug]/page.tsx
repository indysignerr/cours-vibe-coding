import { EventPage } from "@/components/pages/event";
import { eventMetadata, eventParams } from "@/lib/metadata";

export const generateStaticParams = eventParams;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return eventMetadata((await params).slug, "en");
}

export default async function Page({ params }: Props) {
  return <EventPage lang="en" slug={(await params).slug} />;
}
