"use client";

import { useState } from "react";
import { Mascot } from "@/components/mascot";
import { getSupabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

/**
 * Trois écrans à la première connexion : le nom tel qu'il s'affichera,
 * le pseudo GitHub, et le consentement RGPD à la publication du nom
 * dans les résultats. Le profil garde la date pour ne plus le montrer.
 */
export function Onboarding({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.full_name);
  const [github, setGithub] = useState(profile.github_login ?? "");
  const [consent, setConsent] = useState(profile.consent_publish);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish() {
    setBusy(true);
    setError(null);
    const { error: err } = await getSupabase()
      .from("profiles")
      .update({
        full_name: name.trim() || profile.full_name,
        github_login: github.trim().replace(/^@/, "") || null,
        consent_publish: consent,
        onboarded_at: new Date().toISOString(),
      })
      .eq("id", profile.id);
    setBusy(false);
    if (err) return setError(err.message);
    onDone();
  }

  const field = "tap mt-2 w-full rounded-2xl border-2 border-line bg-surface px-4 text-base focus:border-accent-line";

  return (
    <div className="card-3d anim-pop mx-auto max-w-lg p-7 md:p-9">
      <div className="flex items-center gap-4">
        <Mascot size={72} mood={step === 2 ? "party" : "happy"} className="anim-float" />
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-muted">Welcome · {step + 1} of 3</p>
          <h2 className="font-display text-2xl font-extrabold">
            {step === 0 ? "How should we call you?" : step === 1 ? "Where does your code live?" : "One honest question"}
          </h2>
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>

      {step === 0 ? (
        <>
          <label className="mt-7 block text-sm font-bold" htmlFor="ob-name">Your name, as shown on the board</label>
          <input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
          <p className="mt-2 text-sm text-muted">First name and surname. You can change it later.</p>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <label className="mt-7 block text-sm font-bold" htmlFor="ob-gh">GitHub username</label>
          <input id="ob-gh" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="octocat" className={field} />
          <p className="mt-2 text-sm text-muted">Optional now, required before the first contest. It links your submissions to your profile.</p>
        </>
      ) : null}

      {step === 2 ? (
        <label className="mt-7 flex cursor-pointer items-start gap-4 rounded-2xl border-2 border-line bg-surface p-4">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 size-6 shrink-0 accent-[var(--done-line)]" />
          <span className="text-base">
            <strong>Show my full name on published contest results.</strong>
            <span className="mt-1 block text-sm text-muted">
              Untick it and results show your first name and initial instead. You can compete either way.
            </span>
          </span>
        </label>
      ) : null}

      {error ? <p role="alert" className="mt-5 rounded-2xl border-2 border-accent-line bg-surface p-4">{error}</p> : null}

      <div className="mt-7 flex gap-3">
        {step > 0 ? (
          <button type="button" className="btn-3d btn-3d--ghost" onClick={() => setStep(step - 1)}>Back</button>
        ) : null}
        {step < 2 ? (
          <button type="button" className="btn-3d flex-1" onClick={() => setStep(step + 1)}>Next</button>
        ) : (
          <button type="button" className="btn-3d btn-3d--done flex-1" disabled={busy} onClick={() => void finish()}>
            {busy ? "Saving…" : "Start my path"}
          </button>
        )}
      </div>
    </div>
  );
}
