"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ComponentType } from "react";
import { hasStoredSession } from "@/lib/supabase/client";

type Island = ComponentType;
const noop = () => () => {};

/**
 * Si une session est mémorisée, on charge à la demande le vrai îlot, qui
 * importe supabase-js. Sinon, un simple lien « Sign in », sans un octet de
 * Supabase. La présence d'une session est lue de façon synchrone au montage.
 */
export function HeaderSession() {
  const stored = useSyncExternalStore(noop, hasStoredSession, () => false);
  const [Island, setIsland] = useState<Island | null>(null);

  useEffect(() => {
    if (!stored) return;
    let alive = true;
    void import("@/components/header-session-island").then((m) => {
      if (alive) setIsland(() => m.HeaderSessionIsland);
    });
    return () => { alive = false; };
  }, [stored]);

  if (Island) return <Island />;
  return (
    <Link className={`btn btn--primary ml-2 ${stored ? "invisible" : ""}`} href="/sessions/" aria-hidden={stored}>
      Sign in
    </Link>
  );
}
