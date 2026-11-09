-- =====================================================================
-- Albert L.I.G.H.T. — la base, pour un projet Supabase NEUF.
--
-- Tout ce dont le site actuel a besoin, et rien d'autre :
--   1. les profils des organisateurs et leur rôle ;
--   2. les événements (pour la jauge et l'ouverture des inscriptions) ;
--   3. les inscriptions, jamais lisibles par le public ;
--   4. `rsvp`, le seul chemin d'écriture, et `event_counts`, le compteur.
--
-- À coller en une fois dans l'éditeur SQL d'un projet neuf, puis jouer
-- supabase/008_programme.sql pour charger le calendrier.
--
-- Sur le projet d'origine (celui qui a connu le parcours de cours), ne PAS
-- jouer ce fichier : les tables existent déjà, 008_programme.sql suffit.
--
-- Rejouable sans dégât : rien n'est supprimé, tout est en « if not exists »
-- ou « create or replace ».
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Les organisateurs. Venir à un événement ne demande aucun compte :
--    les seuls comptes sont ceux des gens qui tiennent les listes, créés
--    à la main (voir le bloc en fin de fichier).
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text not null,
  role        text not null default 'member' check (role in ('member', 'admin')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer : la fonction lit `profiles` sans dépendre des
-- politiques de cette même table (sinon elle se mordrait la queue).
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Chacun lit son propre profil ; un organisateur les lit tous. Aucune
-- politique d'écriture : un rôle ne se donne que depuis l'éditeur SQL.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------
-- 2. Les événements. Publics : rien de secret, ce sont les dates du site.
--    Le contenu affiché vit dans content/events.json ; cette table ne
--    porte que ce dont les inscriptions ont besoin. `kind` est une
--    étiquette libre, que le site ne lit pas.
-- ---------------------------------------------------------------------
create table if not exists public.events (
  slug        text primary key,
  title       text not null,
  kind        text not null default 'event',
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
-- 3. Les inscriptions. Jamais lisibles par le public, et aucune écriture
--    directe : tout passe par la fonction `rsvp` ci-dessous.
-- ---------------------------------------------------------------------
create table if not exists public.event_signups (
  id            uuid primary key default gen_random_uuid(),
  event_slug    text not null references public.events(slug) on delete cascade,
  full_name     text not null check (length(btrim(full_name)) between 2 and 80),
  email         text not null check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  -- La promo et l'année, ou le nom d'une entreprise pour un invité.
  organisation  text check (organisation is null or length(organisation) <= 120),
  -- La case « join Albert L.I.G.H.T. » arrive ici, en tête : « [JOIN] … ».
  note          text check (note is null or length(note) <= 500),
  created_at    timestamptz not null default now(),
  unique (event_slug, email)
);

create index if not exists event_signups_by_event
  on public.event_signups (event_slug, created_at desc);

alter table public.event_signups enable row level security;

-- Aucune politique pour anon : ni lecture, ni écriture directe.
drop policy if exists event_signups_read on public.event_signups;
create policy event_signups_read on public.event_signups for select to authenticated
  using (public.is_admin());
drop policy if exists event_signups_manage on public.event_signups;
create policy event_signups_manage on public.event_signups for delete to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4. Le seul chemin d'écriture. Renvoie le nombre de places restantes,
--    ou null quand l'événement n'a pas de jauge.
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
-- 5. Combien d'inscrits par événement. Renvoie un compte, jamais une
--    identité. C'est aussi la sonde de la page d'un événement : si elle
--    ne répond pas, la page n'affiche pas le formulaire.
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
-- 6. Donner le rôle d'organisateur à quelqu'un.
--
--    a. Dans le tableau de bord Supabase : Authentication → Users →
--       Add user (email + mot de passe), une fois par organisateur.
--    b. Puis jouer ceci, en remplaçant l'email et le nom :
--
-- insert into public.profiles (id, full_name, role)
-- select id, 'Prénom Nom', 'admin' from auth.users where email = 'prenom@exemple.com'
-- on conflict (id) do update set role = 'admin', full_name = excluded.full_name;
--
--    La personne se connecte ensuite sur https://albertlight.com/admin/.
-- ---------------------------------------------------------------------
