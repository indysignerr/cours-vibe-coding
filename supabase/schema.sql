-- =====================================================================
-- Asso vibecoding Albert School — schéma Supabase
-- Inscription sur invitation uniquement. Le verrou des séances est
-- appliqué par RLS : une séance verrouillée ne quitte jamais la base.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Invitations : pas d'inscription ouverte, vous ajoutez les emails
-- à la main tous les deux avant d'envoyer le lien du site.
-- ---------------------------------------------------------------------
create table invitations (
  email       text primary key check (email = lower(email)),
  full_name   text,
  code        text not null default upper(substr(md5(random()::text), 1, 6)),
  invited_by  uuid,
  created_at  timestamptz not null default now(),
  claimed_at  timestamptz
);

-- ---------------------------------------------------------------------
-- Profils. Le nom complet est public : les gagnants sont affichés
-- en prénom et nom, avec accord écrit des étudiants.
-- ---------------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  full_name    text not null,
  github_login text,
  role         text not null default 'student' check (role in ('student','judge','admin')),
  created_at   timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
  language sql security definer stable set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
  $$;

create or replace function public.is_judge() returns boolean
  language sql security definer stable set search_path = public as $$
    select exists (select 1 from public.profiles where id = auth.uid() and role in ('judge','admin'));
  $$;

-- ---------------------------------------------------------------------
-- Séances
-- ---------------------------------------------------------------------
create table sessions (
  id           uuid primary key default gen_random_uuid(),
  number       int  not null unique,
  slug         text not null unique,
  title        text not null,
  promise      text not null,          -- la victoire de fin d'heure
  concept      text,                   -- la notion unique introduite
  held_on      date,
  starter_repo text,
  support_md   text,
  brief_md     text,
  is_unlocked  boolean not null default false,
  updated_at   timestamptz not null default now()
);

-- Table distincte : la RLS agit par ligne et pas par colonne, et le
-- corrigé se déverrouille après la séance, pas avec elle.
create table session_solutions (
  session_id    uuid primary key references sessions on delete cascade,
  body_md       text not null,
  solution_repo text,
  is_unlocked   boolean not null default false
);

create table session_prompts (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  position   int  not null,
  label      text,
  body       text not null,
  unique (session_id, position)
);

create table session_checks (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions on delete cascade,
  position   int  not null,
  label      text not null,
  is_bonus   boolean not null default false,
  unique (session_id, position)
);

create table check_completions (
  profile_id   uuid not null references profiles on delete cascade,
  check_id     uuid not null references session_checks on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (profile_id, check_id)
);

-- ---------------------------------------------------------------------
-- Grilles de notation, réutilisables d'un concours à l'autre
-- ---------------------------------------------------------------------
create table rubrics (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  is_default  boolean not null default false
);

create table rubric_groups (
  id               uuid primary key default gen_random_uuid(),
  rubric_id        uuid not null references rubrics on delete cascade,
  position         int  not null,
  label            text not null,
  weight           int  not null default 0,      -- 0 pour le portillon
  is_gate          boolean not null default false, -- éliminatoire, ne rapporte pas de points
  from_constraints boolean not null default false, -- une ligne par contrainte du concours
  unique (rubric_id, position)
);

create table rubric_criteria (
  id       uuid primary key default gen_random_uuid(),
  group_id uuid not null references rubric_groups on delete cascade,
  position int  not null,
  label    text not null,
  hint     text,                                  -- ce que le juré regarde concrètement
  unique (group_id, position)
);

-- ---------------------------------------------------------------------
-- Concours
-- ---------------------------------------------------------------------
create table contests (
  id           uuid primary key default gen_random_uuid(),
  number       int  not null unique,
  title        text not null,
  brief_md     text,
  rubric_id    uuid references rubrics on delete set null,
  announced_at timestamptz,
  deadline     timestamptz not null,
  prize_cents  int  not null default 5000,
  status       text not null default 'draft'
                 check (status in ('draft','open','judging','closed'))
);

create table contest_constraints (
  id         uuid primary key default gen_random_uuid(),
  contest_id uuid not null references contests on delete cascade,
  position   int  not null,
  body       text not null,
  unique (contest_id, position)
);

create table submissions (
  id           uuid primary key default gen_random_uuid(),
  contest_id   uuid not null references contests on delete cascade,
  profile_id   uuid not null references profiles on delete cascade,
  title        text not null,
  live_url     text not null,
  repo_url     text not null,
  note         text,                      -- les 30 secondes d'explication, écrites
  submitted_at timestamptz not null default now(),
  unique (contest_id, profile_id)
);

-- Notation à trois valeurs : 0 = absent, 1 = partiel, 2 = plein.
-- Une note porte soit sur un critère de grille, soit sur une contrainte
-- du concours, jamais les deux.
create table scores (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions on delete cascade,
  judge_id      uuid not null references profiles on delete cascade,
  criterion_id  uuid references rubric_criteria on delete cascade,
  constraint_id uuid references contest_constraints on delete cascade,
  value         int  not null check (value in (0, 1, 2)),
  check (num_nonnulls(criterion_id, constraint_id) = 1)
);

create unique index scores_one_per_criterion
  on scores (submission_id, judge_id, criterion_id) where criterion_id is not null;
create unique index scores_one_per_constraint
  on scores (submission_id, judge_id, constraint_id) where constraint_id is not null;

create table results (
  contest_id    uuid not null references contests on delete cascade,
  submission_id uuid not null references submissions on delete cascade,
  rank          int  not null,
  is_winner     boolean not null default false,
  mention       text,
  note          text,                     -- une phrase sur chaque projet rendu
  primary key (contest_id, submission_id)
);

-- =====================================================================
-- RLS
-- =====================================================================
alter table invitations         enable row level security;
alter table profiles            enable row level security;
alter table sessions            enable row level security;
alter table session_solutions   enable row level security;
alter table session_prompts     enable row level security;
alter table session_checks      enable row level security;
alter table check_completions   enable row level security;
alter table rubrics             enable row level security;
alter table rubric_groups       enable row level security;
alter table rubric_criteria     enable row level security;
alter table contests            enable row level security;
alter table contest_constraints enable row level security;
alter table submissions         enable row level security;
alter table scores              enable row level security;
alter table results             enable row level security;

create policy invitations_admin on invitations for all using (is_admin());

create policy profiles_read on profiles for select to authenticated using (id = auth.uid() or is_judge());
create policy profiles_self_write on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
-- Le rôle est en lecture seule pour son propriétaire : voir protect_profile_role.
create policy profiles_admin on profiles for all using (is_admin());

-- Le verrou des séances est ici.
create policy sessions_read on sessions for select
  to authenticated using (is_unlocked or is_admin());
create policy sessions_admin on sessions for all using (is_admin());

create policy solutions_read on session_solutions for select to authenticated using (
  is_admin() or (is_unlocked and exists (select 1 from sessions s where s.id = session_id and s.is_unlocked))
);
create policy solutions_admin on session_solutions for all using (is_admin());

create policy prompts_read on session_prompts for select to authenticated using (
  is_admin() or exists (select 1 from sessions s where s.id = session_id and s.is_unlocked)
);
create policy prompts_admin on session_prompts for all using (is_admin());

create policy checks_read on session_checks for select to authenticated using (
  is_admin() or exists (select 1 from sessions s where s.id = session_id and s.is_unlocked)
);
create policy checks_admin on session_checks for all using (is_admin());

create policy completions_own on check_completions for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid() and exists (
    select 1 from session_checks sc join sessions s on s.id = sc.session_id
    where sc.id = check_id and s.is_unlocked));
create policy completions_admin on check_completions for select using (is_admin());

-- La grille est publique avant le concours, toujours.
create policy rubrics_read   on rubrics         for select to authenticated using (true);
create policy groups_read    on rubric_groups   for select to authenticated using (true);
create policy criteria_read  on rubric_criteria for select to authenticated using (true);
create policy rubrics_admin  on rubrics         for all using (is_admin());
create policy groups_admin   on rubric_groups   for all using (is_admin());
create policy criteria_admin on rubric_criteria for all using (is_admin());

create policy contests_read on contests for select
  to authenticated using (status <> 'draft' or is_admin());
create policy contests_admin on contests for all using (is_admin());

create policy constraints_read on contest_constraints for select to authenticated using (
  is_admin() or exists (select 1 from contests c where c.id = contest_id and c.status <> 'draft')
);
create policy constraints_admin on contest_constraints for all using (is_admin());

-- Rendus : on dépose le sien tant que le concours est ouvert,
-- on lit ceux des autres après clôture.
create policy submissions_insert_own on submissions for insert to authenticated with check (
  profile_id = auth.uid()
  and exists (select 1 from contests c
              where c.id = contest_id and c.status = 'open' and now() < c.deadline)
);
create policy submissions_update_own on submissions for update to authenticated using (
  profile_id = auth.uid()
  and exists (select 1 from contests c
              where c.id = contest_id and c.status = 'open' and now() < c.deadline)
);
create policy submissions_read on submissions for select to authenticated using (
  profile_id = auth.uid()
  or is_judge()
  or exists (select 1 from contests c where c.id = contest_id and c.status = 'closed')
);
create policy submissions_admin on submissions for all using (is_admin());

-- Chaque juré ne voit que ses propres notes : on note en aveugle,
-- on compare les totaux après.
create policy scores_judge on scores for all to authenticated
  using (judge_id = auth.uid() and is_judge())
  with check (judge_id = auth.uid() and is_judge());
create policy scores_admin on scores for all using (is_admin());

create policy results_read on results for select to authenticated using (
  is_admin() or exists (select 1 from contests c where c.id = contest_id and c.status = 'closed')
);
create policy results_admin on results for all using (is_admin());

-- =====================================================================
-- Inscription sur invitation
-- =====================================================================
-- Ce trigger est déclenché par le service d'authentification, dont le
-- search_path ne contient pas `public`. Sans le fixer ici, `invitations`
-- et `profiles` sont introuvables et toute inscription échoue avec
-- « Database error saving new user ». Vécu sur ce projet.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
  declare inv public.invitations%rowtype;
  begin
    select * into inv from public.invitations where email = lower(new.email);
    if not found then
      raise exception 'This email has not been invited.';
    end if;

    insert into public.profiles (id, full_name)
    values (new.id, coalesce(inv.full_name,
                             new.raw_user_meta_data->>'full_name',
                             split_part(new.email, '@', 1)));

    update public.invitations set claimed_at = now() where email = lower(new.email);
    return new;
  end;
  $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ Règles de sécurité (voir 004_security.sql) ============
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
