import { ViewTransition } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Locale, PageRef } from "@/lib/i18n";

/**
 * Le cadre d'une page : en-tête, contenu, pied.
 *
 * Le contenu est enveloppé dans un <ViewTransition> : dans le routeur
 * d'application, une navigation est une transition React, et le
 * navigateur anime tout seul l'ancienne page vers la nouvelle (un
 * balayage, réglé dans globals.css). Aucune bibliothèque, aucun état.
 * L'enveloppe est ici, dans la page, et pas dans le layout : un layout
 * persiste d'une route à l'autre, il n'entre ni ne sort jamais.
 *
 * Sans prise en charge du navigateur, ou en mouvement réduit, la page
 * change simplement d'un coup.
 */
export function PageFrame({
  lang,
  page,
  children,
}: {
  lang: Locale;
  /** La page courante ; null pour les pages qui n'existent qu'en anglais. */
  page: PageRef | null;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader lang={lang} page={page} />
      <ViewTransition enter="page-in" exit="page-out" default="none">
        <main id="main">{children}</main>
      </ViewTransition>
      <SiteFooter lang={lang} page={page} />
    </>
  );
}
