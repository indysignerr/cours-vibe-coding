"use client";

import { useEffect, useState } from "react";
import { AuthGate, SignOutButton } from "@/components/auth-gate";
import { Mascot } from "@/components/mascot";
import { Onboarding } from "@/components/onboarding";
import { Skeleton } from "@/components/skeleton";
import { StatPills } from "@/components/stat-pills";
import { BADGES } from "@/lib/badges";
import { loadStats, type Stats } from "@/lib/progress";
import type { Profile } from "@/lib/types";

function Me({ profile, userId, reload }: { profile: Profile | null; userId: string; reload: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    void loadStats(userId).then(setStats);
  }, [userId]);

  if (editing && profile) return <Onboarding profile={profile} onDone={() => { setEditing(false); reload(); }} />;
  if (!stats) return <Skeleton rows={4} />;

  const earned = new Set(stats.badges);

  return (
    <>
      <div className="card-3d flex flex-wrap items-center justify-between gap-6 p-6 md:p-8">
        <div className="flex items-center gap-5">
          <Mascot size={88} mood={stats.streak >= 3 ? "party" : "happy"} className="anim-float" />
          <div>
            <p className="font-display text-2xl font-extrabold">{profile?.full_name}</p>
            <p className="text-sm text-muted">{profile?.github_login ? `@${profile.github_login}` : "No GitHub username yet"}</p>
            <p className="mt-1 text-sm text-muted">
              {profile?.consent_publish ? "Full name shown on results" : "First name and initial on results"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <StatPills streak={stats.streak} xp={stats.xp} badges={stats.badges.length} />
          <div className="flex gap-3">
            <button type="button" className="btn-3d btn-3d--ghost min-h-[44px] text-sm" onClick={() => setEditing(true)}>Edit profile</button>
            <SignOutButton />
          </div>
        </div>
      </div>

      <h2 className="mt-12 font-display text-display-md font-extrabold">Badges</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((b, i) => {
          const on = earned.has(b.id);
          return (
            <li
              key={b.id}
              className={`card-3d anim-pop flex items-center gap-4 p-5 ${on ? `card-3d--${b.tone}` : "opacity-60 grayscale"}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className={`grid size-14 shrink-0 place-items-center rounded-2xl border-2 ${on ? "border-black/20 bg-surface/60" : "border-line bg-sunken"}`}>
                <b.icon aria-hidden className="size-7" />
              </span>
              <div>
                <p className="font-display text-lg font-extrabold leading-tight">{b.label}</p>
                <p className="mt-0.5 text-sm">{on ? b.description : "Locked"}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function ProfileView() {
  return <AuthGate>{(state) => <Me profile={state.profile} userId={state.userId} reload={() => window.location.reload()} />}</AuthGate>;
}
