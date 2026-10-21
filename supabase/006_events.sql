-- =====================================================================
-- Inscriptions aux évènements.
-- Idempotent : rejouable sans erreur.
--
-- Le site est exporté en statique : il n'y a pas de serveur à nous. Une
-- inscription part donc du navigateur vers Supabase, et c'est la RLS qui
-- tient le verrou — jamais le code de la page.
--
-- Personne n'écrit directement dans event_signups : on passe par la
-- fonction rsvp(), en security definer, qui valide l'évènement, le format
-- de l'email et la jauge. Les visiteurs ne peuvent donc pas lire la liste
-- des inscrits, ni inscrire quelqu'un à un évènement fermé.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Les évènements. Publics : l'affiche doit être lisible sans compte.
-- ---------------------------------------------------------------------
create table if not exists public.events (
  slug        text primary key,
  title       text not null,
  kind        text not null default 'peer-hour'
                check (kind in ('peer-hour', 'contest', 'workshop', 'demo-day')),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null check (ends_at > starts_at),
  location    text,
  summary     text,
  capacity    int check (capacity is null or capacity > 0),
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.events enable row level security;

drop policy if exists events_read on public.events;
create policy events_read on public.events for select to anon, authenticated using (true);

drop policy if exists events_write on public.events;
create policy events_write on public.events for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Les inscriptions. Jamais lisibles par le public.
-- ---------------------------------------------------------------------
create table if not exists public.event_signups (
  id          uuid primary key default gen_random_uuid(),
  event_slug  text not null references public.events(slug) on delete cascade,
  full_name   text not null check (length(btrim(full_name)) between 2 and 80),
  email       text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  note        text check (note is null or length(note) <= 500),
  created_at  timestamptz not null default now(),
  unique (event_slug, email)
);

create index if not exists event_signups_by_event on public.event_signups (event_slug, created_at desc);

alter table public.event_signups enable row level security;

-- Aucune politique pour anon : ni lecture, ni écriture directe.
drop policy if exists event_signups_read on public.event_signups;
create policy event_signups_read on public.event_signups for select to authenticated
  using (public.is_admin() or public.is_judge());

drop policy if exists event_signups_manage on public.event_signups;
create policy event_signups_manage on public.event_signups for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- Le seul chemin d'écriture. Renvoie le nombre de places restantes, ou
-- null quand l'évènement n'a pas de jauge.
-- ---------------------------------------------------------------------
create or replace function public.rsvp(
  p_slug  text,
  p_name  text,
  p_email text,
  p_note  text default null
) returns table (seats_left int)
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_event  public.events%rowtype;
  v_taken  int;
  v_email  text := lower(btrim(p_email));
  v_name   text := btrim(p_name);
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

  insert into public.event_signups (event_slug, full_name, email, note)
  values (p_slug, v_name, v_email, nullif(btrim(p_note), ''))
  on conflict (event_slug, email)
    do update set full_name = excluded.full_name, note = excluded.note;

  select count(*) into v_taken from public.event_signups where event_slug = p_slug;
  return query select case when v_event.capacity is null then null else v_event.capacity - v_taken end;
end $$;

revoke all on function public.rsvp(text, text, text, text) from public;
grant execute on function public.rsvp(text, text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Les évènements de la saison. Les dates viennent de src/lib/curriculum.ts
-- et de src/lib/site.ts : si elles bougent là-bas, rejouer ce bloc.
-- ---------------------------------------------------------------------
insert into public.events (slug, title, kind, starts_at, ends_at, location, summary, capacity) values
  ('peer-hour-weekly', 'Peer hour', 'peer-hour',
   '2026-09-16 18:00+02', '2026-09-16 19:00+02', 'Albert School, Milano',
   'Bring what is blocking you. Someone who already cleared it shows you how.', 30),
  ('contest-1', 'Contest #1', 'contest',
   '2026-10-11 20:00+02', '2026-10-11 23:59+02', 'Online',
   'A landing page built under constraints, submitted before midnight.', null),
  ('contest-2', 'Contest #2', 'contest',
   '2026-11-08 20:00+01', '2026-11-08 23:59+01', 'Online',
   'An app backed by a database, submitted before midnight.', null),
  ('demo-day', 'Demo Day', 'demo-day',
   '2026-12-06 18:00+01', '2026-12-06 21:00+01', 'Albert School, Milano',
   'Your project, presented to a jury, in four minutes.', 80)
on conflict (slug) do update set
  title = excluded.title, kind = excluded.kind,
  starts_at = excluded.starts_at, ends_at = excluded.ends_at,
  location = excluded.location, summary = excluded.summary, capacity = excluded.capacity;
