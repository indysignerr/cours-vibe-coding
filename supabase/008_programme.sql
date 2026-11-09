-- =====================================================================
-- Le programme, tel qu'il est dans content/events.json.
--
-- FICHIER GÉNÉRÉ par `npm run events:sql` — ne pas le modifier à la main.
-- À rejouer dans l'éditeur SQL de Supabase chaque fois qu'un événement est
-- ajouté, ou qu'une date, un horaire ou une jauge change.
--
-- Sans danger, rejouable :
--   — les événements du programme sont créés ou mis à jour ;
--   — ceux qui n'y sont plus sont FERMÉS (is_open = false), jamais
--     supprimés : leurs inscriptions restent lisibles dans /admin/ ;
--   — aucune inscription n'est touchée.
--
-- Prérequis : supabase/007_events.sql a été joué une fois (il crée les
-- tables ; ne PAS le rejouer, il les recrée vides).
--
-- Un événement fermé à la main (is_open = false) le reste : ce fichier ne
-- rouvre rien.
-- =====================================================================

insert into public.events (slug, title, kind, starts_at, ends_at, location, summary, capacity) values
  ('ai-discovery-day-maggiore', 'AI Discovery Day, Lake Maggiore', 'talk', '2026-11-07 00:00 Europe/Rome', '2026-11-07 23:59 Europe/Rome', 'Lake Maggiore', 'A one to two hour session Albert School asked us to run, on entrepreneurship with some data and AI.', null),
  ('tournament-1', 'Vibe coding tournament #1', 'hackathon', '2026-11-21 14:00 Europe/Rome', '2026-11-21 18:00 Europe/Rome', null, 'The first tournament of the year, and the start of the calendar. Teams race the clock to build a working app under a theme.', null),
  ('codemotion-llms-python', 'Codemotion × Albert LIGHT: LLMs in Python', 'workshop', '2026-12-05 10:00 Europe/Rome', '2026-12-05 14:00 Europe/Rome', null, 'A half day on large language models in Python, prepared with Leonardo Ciabattini. Attendees get a certificate.', 30),
  ('build-lab-1', 'Build Lab #1', 'workshop', '2026-12-15 00:00 Europe/Rome', '2026-12-15 23:59 Europe/Rome', null, 'The first Build Lab. One hour on your own project, with an experienced member there each session. Then every other Tuesday.', null),
  ('crash-course-1', 'Crash course #1: AI coding tools speedrun and API keys', 'workshop', '2027-01-14 18:30 Europe/Rome', '2027-01-14 23:59 Europe/Rome', 'Online', 'An online evening on AI coding tools and API keys.', null),
  ('cinema-night', 'Cinema night: Artificial, and a discussion after', 'talk', '2027-01-25 00:00 Europe/Rome', '2027-01-31 23:59 Europe/Rome', null, 'A screening of Artificial with a discussion after it, open to other universities. The film opens in Italy on 20 January 2027, distributed by I Wonder Pictures.', null),
  ('tournament-2', 'Vibe coding tournament #2', 'hackathon', '2027-02-13 00:00 Europe/Rome', '2027-02-13 23:59 Europe/Rome', null, 'The second tournament of the year.', null),
  ('crash-course-2', 'Crash course #2: Docker and CI/CD', 'workshop', '2027-02-25 18:30 Europe/Rome', '2027-02-25 23:59 Europe/Rome', 'Online', 'An online evening on Docker and CI/CD.', null),
  ('crash-course-3', 'Crash course #3: cloud credits for student projects', 'workshop', '2027-03-11 18:30 Europe/Rome', '2027-03-11 23:59 Europe/Rome', 'Online', 'An online evening on getting and using cloud credits for student projects.', null),
  ('demo-day', 'Demo Day', 'talk', '2027-05-15 00:00 Europe/Rome', '2027-05-15 23:59 Europe/Rome', null, 'Members show what they built this year.', null)
on conflict (slug) do update set
  title = excluded.title, kind = excluded.kind,
  starts_at = excluded.starts_at, ends_at = excluded.ends_at,
  location = excluded.location, summary = excluded.summary,
  capacity = excluded.capacity;

-- Ce qui n'est plus au programme ne prend plus d'inscription.
update public.events set is_open = false
where slug not in ('ai-discovery-day-maggiore', 'tournament-1', 'codemotion-llms-python', 'build-lab-1', 'crash-course-1', 'cinema-night', 'tournament-2', 'crash-course-2', 'crash-course-3', 'demo-day');

-- Contrôle : la liste que la page d'un événement interroge.
select slug, starts_at, ends_at, capacity, is_open from public.events order by starts_at;
