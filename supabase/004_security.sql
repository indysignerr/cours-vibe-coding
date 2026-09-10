-- =====================================================================
-- Sécurité et confidentialité, suite à l'audit du 10 septembre 2026.
-- Idempotent : rejouable sans erreur, et autonome : si 002 n'a pas été passé,
-- ce fichier repose lui-même les colonnes dont il a besoin.
-- =====================================================================

-- 0. Colonnes de 002. Répétées ici pour que 004 tienne debout seul : sur un
--    projet où 002 n'a pas été passé, la fonction leaderboard() plus bas
--    échouait avec « column p.consent_publish does not exist ».
alter table public.profiles add column if not exists consent_publish boolean not null default false;
alter table public.profiles add column if not exists onboarded_at timestamptz;

-- 1. Personne ne change son propre rôle. Seul un admin peut promouvoir.
create or replace function public.protect_profile_role() returns trigger
  language plpgsql security definer set search_path = public as $$
  begin
    if new.role is distinct from old.role and not public.is_admin() then
      raise exception 'role is read-only';
    end if;
    return new;
  end $$;
drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard before update on public.profiles
  for each row execute function public.protect_profile_role();

-- 2. La vue contournait la RLS et était lisible sans compte.
drop view if exists public.public_profiles;

-- 3. Un profil n'est lisible que par son propriétaire, les jurés et les admins.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_judge());

-- 4. Invitation à code : l'email seul ne suffit plus pour créer le compte.
alter table public.invitations
  add column if not exists code text not null default upper(substr(md5(random()::text), 1, 6));
alter table public.invitations drop constraint if exists invitations_email_lower;
alter table public.invitations add constraint invitations_email_lower check (email = lower(email));

create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
  declare inv public.invitations%rowtype;
  begin
    select * into inv from public.invitations where email = lower(new.email);
    if not found then
      raise exception 'This email has not been invited.';
    end if;
    if inv.claimed_at is not null then
      raise exception 'This invitation has already been used.';
    end if;
    if inv.code is distinct from upper(coalesce(new.raw_user_meta_data->>'invite_code', '')) then
      raise exception 'Invite code missing or wrong.';
    end if;

    insert into public.profiles (id, full_name)
    values (new.id, coalesce(inv.full_name,
                             new.raw_user_meta_data->>'full_name',
                             split_part(new.email, '@', 1)));

    update public.invitations set claimed_at = now() where email = lower(new.email);
    return new;
  end;
  $$;

-- 5. Rendus : bornes côté base, horodatage non falsifiable.
alter table public.submissions drop constraint if exists submissions_live_url_chk;
alter table public.submissions drop constraint if exists submissions_repo_url_chk;
alter table public.submissions drop constraint if exists submissions_title_chk;
alter table public.submissions drop constraint if exists submissions_note_chk;
alter table public.submissions
  add constraint submissions_live_url_chk check (live_url ~* '^https?://[^/\s]+\.[^/\s]+' and char_length(live_url) <= 2048),
  add constraint submissions_repo_url_chk check (repo_url ~* '^https://' and char_length(repo_url) <= 2048),
  add constraint submissions_title_chk    check (char_length(title) between 1 and 120),
  add constraint submissions_note_chk     check (note is null or char_length(note) <= 2000);

create or replace function public.stamp_submission() returns trigger
  language plpgsql as $$
  begin
    new.submitted_at := now();
    return new;
  end $$;
drop trigger if exists submissions_stamp on public.submissions;
create trigger submissions_stamp before insert or update on public.submissions
  for each row execute function public.stamp_submission();

-- Les jurés lisent les rendus seulement en phase de notation ; les membres
-- ne voient après clôture que les rendus inscrits aux résultats.
drop policy if exists submissions_read on public.submissions;
create policy submissions_read on public.submissions for select to authenticated using (
  profile_id = auth.uid()
  or public.is_admin()
  or (public.is_judge() and exists (select 1 from public.contests c
                                    where c.id = contest_id and c.status in ('judging','closed')))
  or exists (select 1 from public.results r join public.contests c on c.id = r.contest_id
             where r.submission_id = submissions.id and c.status = 'closed')
);

-- 6. Notes : seulement pendant la phase de notation, et seulement sur des
--    lignes qui appartiennent au concours du rendu.
drop policy if exists scores_judge on public.scores;
create policy scores_judge on public.scores for all to authenticated
  using (judge_id = auth.uid() and public.is_judge())
  with check (
    judge_id = auth.uid() and public.is_judge()
    and exists (
      select 1 from public.submissions sub join public.contests c on c.id = sub.contest_id
      where sub.id = submission_id and c.status = 'judging'
        and (constraint_id is null or exists (select 1 from public.contest_constraints cc
              where cc.id = constraint_id and cc.contest_id = c.id))
        and (criterion_id is null or exists (select 1 from public.rubric_criteria rc
              join public.rubric_groups rg on rg.id = rc.group_id
              where rc.id = criterion_id and rg.rubric_id = c.rubric_id))
    )
  );

-- 7. On ne coche que les cases d'une séance ouverte.
drop policy if exists completions_own on public.check_completions;
create policy completions_own on public.check_completions for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and exists (
    select 1 from public.session_checks sc join public.sessions s on s.id = sc.session_id
    where sc.id = check_id and s.is_unlocked));

-- 8. Un corrigé ne se lit que si sa séance est ouverte aussi.
drop policy if exists solutions_read on public.session_solutions;
create policy solutions_read on public.session_solutions for select to authenticated using (
  public.is_admin() or (is_unlocked and exists (
    select 1 from public.sessions s where s.id = session_id and s.is_unlocked))
);

-- 9. Le classement respecte le consentement : sans accord, prénom et initiale.
create or replace function public.leaderboard()
returns table (profile_id uuid, full_name text, xp int, steps_done int, submissions int)
language sql security definer stable set search_path = public as $$
  with req as (
    select sc.session_id, count(*) filter (where not sc.is_bonus) as required
    from public.session_checks sc join public.sessions s on s.id = sc.session_id
    where s.is_unlocked group by sc.session_id
  ),
  done as (
    select cc.profile_id, sc.session_id,
           count(*) filter (where not sc.is_bonus) as ticked, count(*) as all_ticked
    from public.check_completions cc join public.session_checks sc on sc.id = cc.check_id
    group by cc.profile_id, sc.session_id
  ),
  steps as (
    select d.profile_id,
           count(*) filter (where r.required > 0 and d.ticked = r.required) as steps_done,
           sum(d.all_ticked) as checks
    from done d join req r on r.session_id = d.session_id group by d.profile_id
  ),
  subs as (select profile_id, count(*) as n from public.submissions group by profile_id)
  select p.id,
         case when p.consent_publish or p.id = auth.uid() then p.full_name
              else split_part(p.full_name, ' ', 1) || ' ' || left(split_part(p.full_name, ' ', 2), 1) || '.' end,
         (coalesce(st.checks, 0) * 10 + coalesce(sb.n, 0) * 40)::int,
         coalesce(st.steps_done, 0)::int,
         coalesce(sb.n, 0)::int
  from public.profiles p
  left join steps st on st.profile_id = p.id
  left join subs sb on sb.profile_id = p.id
  where p.role = 'student'
  order by 3 desc, 4 desc, 2;
$$;
revoke all on function public.leaderboard() from public, anon;
grant execute on function public.leaderboard() to authenticated;
