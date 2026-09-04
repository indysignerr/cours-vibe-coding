-- =====================================================================
-- BOOTSTRAP — à coller EN UNE FOIS dans le SQL Editor de Supabase.
-- Contient le schéma complet, les politiques RLS, les douze séances,
-- la grille de notation et les trois concours.
-- À la fin, un bloc à décommenter pour vous inviter tous les deux.
-- =====================================================================

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

-- ============ DONNÉES INITIALES ============

-- =====================================================================
-- Données initiales : calendrier des 12 séances, 3 concours, grille par défaut.
-- Les dates sont les LUNDIS de chaque semaine, à corriger dès que
-- l'emploi du temps Albert School est connu.
-- =====================================================================

insert into sessions (number, slug, title, promise, concept, held_on) values
 (1,'ship-something-live','Ship something live',
  'Your own page, live on a public URL, opened from your phone.',
  'The loop: prompt, code, deploy.','2026-09-14'),
 (2,'talk-to-an-agent','Talk to an agent',
  'The same page, rebuilt in three targeted iterations.',
  'Context, spec, plan mode. Iterate instead of starting over.','2026-09-21'),
 (3,'git-as-a-safety-net','Git as a safety net',
  'A project with history, and one revert that saves you.',
  'A commit is a save point. Branch, undo.','2026-09-28'),
 (4,'contest-1','Contest #1',
  'A landing page built under constraints, submitted before midnight.',
  null,'2026-10-05'),
 (5,'structure-a-real-project','Structure a real project',
  'A Next.js app with several pages that hold together.',
  'File tree, components, reading code you did not write.','2026-10-12'),
 (6,'design-not-a-template','Design that is not a template',
  'The same app, but it finally has a face.',
  'Palette, type pairing, hierarchy, spacing.','2026-10-19'),
 (7,'store-data','Store data',
  'A form that writes into a real database.',
  'Tables, rows, queries. Why a JSON file is not enough.','2026-10-26'),
 (8,'contest-2','Contest #2',
  'An app backed by a database, submitted before midnight.',
  null,'2026-11-02'),
 (9,'accounts-and-users','Accounts and users',
  'Working email sign-in on your own app.',
  'Auth, sessions, row level security. What secure actually means.','2026-11-09'),
 (10,'deploy-for-real','Deploy for real',
  'A custom domain and environment variables, wired properly.',
  'Secrets, environments, what must never be committed.','2026-11-16'),
 (11,'automate-your-work','Automate your work',
  'A skill and a subagent doing your chores.',
  'Claude Cowork, skills, agents in parallel.','2026-11-23'),
 (12,'demo-day','Demo Day',
  'Your project, presented to a jury, in four minutes.',
  null,'2026-11-30');

-- ---------------------------------------------------------------------
-- Grille par défaut : juger un site ou une app
-- ---------------------------------------------------------------------
insert into rubrics (id, name, description, is_default) values
 ('00000000-0000-0000-0000-000000000001',
  'Website or app — default grid',
  'Five scored groups over 100 points, behind one pass or fail gate. Every line is scored 0, 1 or 2.',
  true);

insert into rubric_groups (id, rubric_id, position, label, weight, is_gate, from_constraints) values
 ('00000000-0000-0000-0000-0000000000a0','00000000-0000-0000-0000-000000000001',1,'It ships',        0,true,false),
 ('00000000-0000-0000-0000-0000000000a1','00000000-0000-0000-0000-000000000001',2,'Brief compliance',25,false,true),
 ('00000000-0000-0000-0000-0000000000a2','00000000-0000-0000-0000-000000000001',3,'Design craft',    25,false,false),
 ('00000000-0000-0000-0000-0000000000a3','00000000-0000-0000-0000-000000000001',4,'UX and responsive',20,false,false),
 ('00000000-0000-0000-0000-0000000000a4','00000000-0000-0000-0000-000000000001',5,'Idea and content',20,false,false),
 ('00000000-0000-0000-0000-0000000000a5','00000000-0000-0000-0000-000000000001',6,'Ownership',       10,false,false);

insert into rubric_criteria (group_id, position, label, hint) values
 ('00000000-0000-0000-0000-0000000000a0',1,'The live URL opens on a judge phone, first try',
   'No localhost, no video, no screenshot. If it does not open, the project leaves the room.'),
 ('00000000-0000-0000-0000-0000000000a0',2,'Nothing blocks the main flow',
   'The one thing the project is for can be done end to end.'),

 ('00000000-0000-0000-0000-0000000000a2',1,'Typography',
   'A deliberate display and body pairing, a readable hierarchy, no accidental system font.'),
 ('00000000-0000-0000-0000-0000000000a2',2,'Colour and contrast',
   'A chosen palette rather than defaults. Body text passes 4.5 to 1.'),
 ('00000000-0000-0000-0000-0000000000a2',3,'Composition',
   'Spacing rhythm, alignment, something other than an untouched twelve column grid.'),

 ('00000000-0000-0000-0000-0000000000a3',1,'Holds at 375 pixels',
   'No horizontal scroll, touch targets at least 44 pixels.'),
 ('00000000-0000-0000-0000-0000000000a3',2,'The primary action is obvious',
   'One clear thing to do on the first screen, without scrolling.'),
 ('00000000-0000-0000-0000-0000000000a3',3,'Loading, empty and error states',
   'What happens on a slow network, with no data, and when something fails.'),

 ('00000000-0000-0000-0000-0000000000a4',1,'The idea answers a real need',
   'A named person would open this twice.'),
 ('00000000-0000-0000-0000-0000000000a4',2,'The copy is written',
   'No lorem ipsum, no unedited model output, no filler headline.'),
 ('00000000-0000-0000-0000-0000000000a4',3,'We would use it',
   'The gut check. Judges answer yes or no before justifying.'),

 ('00000000-0000-0000-0000-0000000000a5',1,'Thirty seconds of explanation',
   'The student can say what the agent built and why, without reading.'),
 ('00000000-0000-0000-0000-0000000000a5',2,'Clean public repo',
   'Readable commit history, a README, and no secret committed.');

-- ---------------------------------------------------------------------
-- Concours. Deadlines à 23h59 le soir de la séance, à ajuster
-- quand le créneau exact sera connu.
-- ---------------------------------------------------------------------
insert into contests (number, title, rubric_id, deadline, status) values
 (1,'Contest #1','00000000-0000-0000-0000-000000000001','2026-10-05 23:59:00+02','draft'),
 (2,'Contest #2','00000000-0000-0000-0000-000000000001','2026-11-02 23:59:00+01','draft'),
 (3,'Demo Day',  '00000000-0000-0000-0000-000000000001','2026-11-30 23:59:00+01','draft');

-- =====================================================================
-- Gamification : consentement à l'affichage du nom, onboarding, et
-- classement de saison agrégé côté base. À exécuter APRÈS bootstrap.sql.
-- =====================================================================

alter table public.profiles add column if not exists consent_publish boolean not null default false;
alter table public.profiles add column if not exists onboarded_at timestamptz;

-- Le classement agrège les points de tout le monde sans exposer le détail
-- des cases cochées de chacun : c'est pour ça qu'il est en security definer.
-- Même barème que src/lib/progress.ts : 10 par case, 40 par rendu.
create or replace function public.leaderboard()
returns table (profile_id uuid, full_name text, xp int, steps_done int, submissions int, consent_publish boolean)
language sql security definer stable set search_path = public as $$
  with req as (
    select sc.session_id, count(*) filter (where not sc.is_bonus) as required
    from public.session_checks sc
    join public.sessions s on s.id = sc.session_id
    where s.is_unlocked
    group by sc.session_id
  ),
  done as (
    select cc.profile_id, sc.session_id,
           count(*) filter (where not sc.is_bonus) as ticked,
           count(*) as all_ticked
    from public.check_completions cc
    join public.session_checks sc on sc.id = cc.check_id
    group by cc.profile_id, sc.session_id
  ),
  steps as (
    select d.profile_id,
           count(*) filter (where r.required > 0 and d.ticked = r.required) as steps_done,
           sum(d.all_ticked) as checks
    from done d join req r on r.session_id = d.session_id
    group by d.profile_id
  ),
  subs as (select profile_id, count(*) as n from public.submissions group by profile_id)
  select p.id, p.full_name,
         (coalesce(st.checks, 0) * 10 + coalesce(sb.n, 0) * 40)::int as xp,
         coalesce(st.steps_done, 0)::int as steps_done,
         coalesce(sb.n, 0)::int as submissions,
         p.consent_publish
  from public.profiles p
  left join steps st on st.profile_id = p.id
  left join subs sb on sb.profile_id = p.id
  where p.role = 'student'
  order by xp desc, steps_done desc, p.full_name;
$$;

revoke all on function public.leaderboard() from public, anon;
grant execute on function public.leaderboard() to authenticated;

-- =====================================================================
-- À FAIRE MAINTENANT : remplacez les deux adresses puis exécutez.
-- Personne ne peut créer de compte sans figurer ici, vous compris.
-- =====================================================================
-- insert into invitations (email, full_name) values
--   ('toi@example.com',     'Ton Prénom Nom'),
--   ('associe@example.com', 'Son Prénom Nom');

-- =====================================================================
-- APRÈS votre première connexion sur le site, exécutez ceci pour vous
-- donner les droits d'organisateur. Mêmes adresses que ci-dessus.
-- =====================================================================
-- update profiles set role = 'admin'
-- where id in (select id from auth.users
--              where email in ('toi@example.com', 'associe@example.com'));

-- Contrôle : doit renvoyer deux lignes en admin.
-- select full_name, role from profiles;
