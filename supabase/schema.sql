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
  email       text primary key,
  full_name   text,
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

create view public_profiles as
  select id, full_name, github_login from profiles;

create or replace function is_admin() returns boolean
  language sql security definer stable as $$
    select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
  $$;

create or replace function is_judge() returns boolean
  language sql security definer stable as $$
    select exists (select 1 from profiles where id = auth.uid() and role in ('judge','admin'));
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

create policy profiles_read on profiles for select to authenticated using (true);
create policy profiles_self_write on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin on profiles for all using (is_admin());

-- Le verrou des séances est ici.
create policy sessions_read on sessions for select
  to authenticated using (is_unlocked or is_admin());
create policy sessions_admin on sessions for all using (is_admin());

create policy solutions_read on session_solutions for select
  to authenticated using (is_unlocked or is_admin());
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
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
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
create or replace function handle_new_user() returns trigger
  language plpgsql security definer as $$
  declare inv invitations%rowtype;
  begin
    select * into inv from invitations where email = lower(new.email);
    if not found then
      raise exception 'This email has not been invited.';
    end if;

    insert into profiles (id, full_name)
    values (new.id, coalesce(inv.full_name,
                             new.raw_user_meta_data->>'full_name',
                             split_part(new.email, '@', 1)));

    update invitations set claimed_at = now() where email = lower(new.email);
    return new;
  end;
  $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
