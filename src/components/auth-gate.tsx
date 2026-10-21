"use client";

import { AccountForm } from "@/components/account-form";
import { Onboarding } from "@/components/onboarding";
import { Skeleton } from "@/components/skeleton";
import { configurationProblem, getSupabase } from "@/lib/supabase/client";
import { useAuth, type AuthState } from "@/lib/use-auth";

/** Écran affiché tant que la configuration Supabase n'est pas exploitable. */
function NotConfigured() {
  const problem = configurationProblem();
  return (
    <div className="card card--sand max-w-measure p-7">
      <h2 className="display-3">Accounts are not switched on yet</h2>
      <p className="mt-3 text-body">
        The database for this club has not been connected. Session material and contest submissions
        will live here once it is. Nothing is broken on your side.
      </p>
      {problem ? <p className="mt-5 rounded-btn bg-canvas p-4 text-sm text-muted">For the organisers: {problem}</p> : null}
    </div>
  );
}

/** Rend ses enfants seulement pour un membre connecté. */
export function AuthGate({
  children,
  requireAdmin = false,
}: {
  children: (state: Extract<AuthState, { status: "ready" }>) => React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { state, reload } = useAuth();

  if (state.status === "unconfigured") return <NotConfigured />;
  if (state.status === "loading") return <Skeleton rows={3} />;
  if (state.status === "anonymous") return <AccountForm defaultMode="signup" onDone={reload} />;

  // Première connexion : trois écrans avant d'entrer. La colonne onboarded_at
  // n'existe qu'après 002 ; si elle manque, le profil n'a pas la clé et on n'impose rien.
  if (state.profile && "onboarded_at" in state.profile && !state.profile.onboarded_at && !requireAdmin) {
    return <Onboarding profile={state.profile} onDone={reload} />;
  }

  if (requireAdmin && state.profile?.role !== "admin") {
    return (
      <div className="card card--sand max-w-measure p-7">
        <h2 className="display-3">Organisers only</h2>
        <p className="mt-3 text-body">This page is for the two people running the club. Your account is signed in as a member.</p>
      </div>
    );
  }

  return <>{children(state)}</>;
}

export function SignOutButton() {
  return (
    <button type="button" onClick={() => void getSupabase().auth.signOut()} className="btn btn--ghost">
      Sign out
    </button>
  );
}
