import data from "@content/faq.json";
import type { Locale } from "@/lib/i18n";

/**
 * Les questions fréquentes, lues dans content/faq.json.
 *
 * Règle du fichier : une réponse ne dit que ce que le plan annuel ou le
 * texte officiel de l'association disent déjà. Rien n'est ajouté ici.
 */
export type FaqItem = { id: string; q: string; a: string; home: boolean };
export type FaqGroup = { id: string; title: string; items: FaqItem[] };

export function getFaq(lang: Locale = "en"): FaqGroup[] {
  return data.groups.map((g) => ({
    id: g.id,
    title: g.title[lang],
    items: g.items.map((i) => ({ id: i.id, q: i.q[lang], a: i.a[lang], home: i.home })),
  }));
}

/** Les quelques questions reprises sur l'accueil. */
export const homeFaq = (lang: Locale = "en") =>
  getFaq(lang)
    .flatMap((g) => g.items)
    .filter((i) => i.home);

/** Le schéma FAQPage : les mêmes questions, lisibles par les moteurs. */
export function faqSchema(lang: Locale = "en") {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: lang,
    mainEntity: getFaq(lang)
      .flatMap((g) => g.items)
      .map((i) => ({
        "@type": "Question",
        name: i.q,
        acceptedAnswer: { "@type": "Answer", text: i.a },
      })),
  };
}
