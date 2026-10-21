"use client";

import { AccountForm } from "@/components/account-form";
import { Skeleton } from "@/components/skeleton";
import { configurationProblem, getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/use-auth";

/** Écran affiché tant que la configuration Supabase n'est pas exploitable. */
function NotConfigured() {
  const problem = configurationProblem();
  return (
    <div className="card card--sand max-w-measure p-7">
      <h2 className="display-3">Sign-ups are not switched on yet</h2>
      <p className="mt-3 text-body">
        The database has not been connected, so there is nothing to show. Nothing is broken on your
        side.
      </p>
      {problem ? (
        <p className="mt-5 rounded-btn bg-canvas p-4 text-sm text-muted">
          For the organisers: {problem}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Rend ses enfants seulement pour un organisateur connecté.
 *
 * Les enfants sont un ReactNode ordinaire, pas une fonction : une page
 * serveur ne peut pas passer de fonction à un composant client, et le
 * tableau de bord n'a de toute façon pas besoin de l'état de session.
 *
 * Ce composant n'est qu'un écran. Le vrai verrou est la politique RLS :
 * sans le rôle admin, la requête ne renvoie aucune ligne.
 */
export function AuthGate({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { state, reload } = useAuth();

  if (state.status === "unconfigured") return <NotConfigured />;
  if (state.status === "loading") return <Skeleton rows={3} />;
  if (state.status === "anonymous") return <AccountForm defaultMode="signin" onDone={reload} />;

  if (requireAdmin && state.profile?.role !== "admin") {
    return (
      <div className="card card--sand max-w-measure p-7">
        <h2 className="display-3">Organisers only</h2>
        <p className="mt-3 text-body">
          This page is for the people running the association. Your account is signed in, but it does
          not have that role.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void getSupabase().auth.signOut()}
      className="btn btn--ghost"
    >
      Sign out
    </button>
  );
}
