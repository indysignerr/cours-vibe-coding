-- =====================================================================
-- Le modèle « évènements ».
--
-- L'association n'a plus de parcours de cours hebdomadaire ni de concours :
-- elle organise des hackathons, des ateliers, des conférences et des
-- rencontres entreprises. Ce fichier remplace tout l'appareil de cours.
--
-- 🔴 DESTRUCTIF. Les tables du parcours sont supprimées, avec leur contenu.
--    À ne jouer qu'une fois, en connaissance de cause. Si des soumissions
--    de concours doivent être gardées, les exporter AVANT.
--
-- Idempotent : rejouable sans erreur une fois passé.
-- =====================================================================

-- 1. On démonte le parcours de cours.
drop table if exists public.submissions cascade;
drop table if exists public.scores cascade;
drop table if exists public.session_progress cascade;
drop table if exists public.session_steps cascade;
drop table if exists public.sessions cascade;
drop table if exists public.contests cascade;
drop table if exists public.badges cascade;
drop table if exists public.profile_badges cascade;
drop function if exists public.leaderboard() cascade;
drop function if exists public.award_badges(uuid) cascade;

-- Les anciens évènements de 006, si ce fichier a été joué : le modèle change.
drop table if exists public.event_signups cascade;
drop table if exists public.events cascade;

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 2. Les évènements. Publics : l'affiche doit être lisible sans compte.
--    Les fiches affichées sur le site vivent dans src/lib/events.ts ;
--    cette table existe pour porter les inscriptions et la jauge.
-- ---------------------------------------------------------------------
create table public.events (
  slug        text primary key,
  title       text not null,
  kind        text not null
                check (kind in ('hackathon', 'workshop', 'talk', 'company')),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null check (ends_at > starts_at),
  location    text,
  summary     text,
  capacity    int check (capacity is null or capacity > 0),
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

create policy events_read on public.events for select to anon, authenticated using (true);
create policy events_write on public.events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. Les inscriptions. Jamais lisibles par le public.
--    Pas de compte requis : on vient à un hackathon sans créer de profil.
-- ---------------------------------------------------------------------
create table public.event_signups (
  id            uuid primary key default gen_random_uuid(),
  event_slug    text not null references public.events(slug) on delete cascade,
  full_name     text not null check (length(btrim(full_name)) between 2 and 80),
  email         text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- « student » ou le nom de l'entreprise : une soirée démo mélange les deux.
  organisation  text check (organisation is null or length(organisation) <= 120),
  note          text check (note is null or length(note) <= 500),
  created_at    timestamptz not null default now(),
  unique (event_slug, email)
);

create index event_signups_by_event on public.event_signups (event_slug, created_at desc);

alter table public.event_signups enable row level security;

-- Aucune politique pour anon : ni lecture, ni écriture directe.
create policy event_signups_read on public.event_signups for select to authenticated
  using (public.is_admin());
create policy event_signups_manage on public.event_signups for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Le seul chemin d'écriture. Renvoie le nombre de places restantes,
--    ou null quand l'évènement n'a pas de jauge.
-- ---------------------------------------------------------------------
create or replace function public.rsvp(
  p_slug         text,
  p_name         text,
  p_email        text,
  p_organisation text default null,
  p_note         text default null
) returns table (seats_left int)
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_taken int;
  v_email text := lower(btrim(p_email));
begin
  select * into v_event from public.events where slug = p_slug;
  if not found then
    raise exception 'unknown event' using errcode = 'P0002';
  end if;
  if not v_event.is_open then
    raise exception 'event closed' using errcode = 'P0001';
  end if;
  if v_event.ends_at < now() then
    raise exception 'event past' using errcode = 'P0001';
  end if;

  select count(*) into v_taken from public.event_signups where event_slug = p_slug;
  if v_event.capacity is not null and v_taken >= v_event.capacity then
    -- La jauge ne bloque pas quelqu'un déjà inscrit qui met son nom à jour.
    if not exists (select 1 from public.event_signups where event_slug = p_slug and email = v_email) then
      raise exception 'event full' using errcode = 'P0001';
    end if;
  end if;

  insert into public.event_signups (event_slug, full_name, email, organisation, note)
  values (p_slug, btrim(p_name), v_email, nullif(btrim(p_organisation), ''), nullif(btrim(p_note), ''))
  on conflict (event_slug, email) do update
    set full_name = excluded.full_name,
        organisation = excluded.organisation,
        note = excluded.note;

  select count(*) into v_taken from public.event_signups where event_slug = p_slug;
  return query select case when v_event.capacity is null then null else v_event.capacity - v_taken end;
end $$;

revoke all on function public.rsvp(text, text, text, text, text) from public;
grant execute on function public.rsvp(text, text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 5. Combien d'inscrits, visible de tous : la jauge s'affiche sur l'affiche.
--    Renvoie un compte, jamais une identité.
-- ---------------------------------------------------------------------
create or replace function public.event_counts()
  returns table (event_slug text, taken int, capacity int)
  language sql
  security definer
  set search_path = public
as $$
  select e.slug, coalesce(count(s.id), 0)::int, e.capacity
  from public.events e
  left join public.event_signups s on s.event_slug = e.slug
  group by e.slug, e.capacity
$$;

revoke all on function public.event_counts() from public;
grant execute on function public.event_counts() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. Le programme. Les mêmes slugs que src/lib/events.ts.
--    Modifier une date ici ET là-bas, sinon l'affiche et la jauge divergent.
-- ---------------------------------------------------------------------
insert into public.events (slug, title, kind, starts_at, ends_at, location, summary, capacity) values
  ('workshop-idea-to-url', 'From an idea to a live URL', 'workshop',
   '2026-11-05 18:00+01', '2026-11-05 21:00+01', 'Albert School, Milano',
   'Three hours, from an empty folder to a page anyone in the world can open.', 25),
  ('hackathon-ship-in-24', 'Ship in 24', 'hackathon',
   '2026-11-21 10:00+01', '2026-11-22 18:00+01', 'Albert School, Milano',
   'Twenty-four hours, teams of three, one brief handed out at the start.', 60),
  ('talk-what-the-law-says', 'What the law actually says about AI at work', 'talk',
   '2026-12-03 19:00+01', '2026-12-03 20:00+01', 'Albert School, Milano',
   'The three texts that decide whether a company may use the tools its staff already use.', 100),
  ('company-demo-night', 'Demo night', 'company',
   '2027-02-11 18:30+01', '2027-02-11 21:30+01', 'Albert School, Milano',
   'Students show what they built, directors say whether they would have paid for it.', 80)
on conflict (slug) do update set
  title = excluded.title, kind = excluded.kind,
  starts_at = excluded.starts_at, ends_at = excluded.ends_at,
  location = excluded.location, summary = excluded.summary, capacity = excluded.capacity;
