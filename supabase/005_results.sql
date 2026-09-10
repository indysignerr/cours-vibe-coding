-- =====================================================================
-- Résultats de concours : lecture agrégée, noms selon le consentement.
-- Idempotent. À exécuter après 004_security.sql.
-- =====================================================================
alter table public.profiles add column if not exists consent_publish boolean not null default false;

create or replace function public.contest_results()
returns table (
  contest_number int, contest_title text, rank int, is_winner boolean,
  mention text, note text, display_name text, project_title text, live_url text, repo_url text
)
language sql security definer stable set search_path = public as $$
  select c.number, c.title, r.rank, r.is_winner, r.mention, r.note,
         case when p.consent_publish then p.full_name
              else split_part(p.full_name, ' ', 1) || ' ' || left(split_part(p.full_name, ' ', 2), 1) || '.' end,
         s.title, s.live_url, s.repo_url
  from public.results r
  join public.contests c on c.id = r.contest_id
  join public.submissions s on s.id = r.submission_id
  join public.profiles p on p.id = s.profile_id
  where c.status = 'closed'
  order by c.number desc, r.rank;
$$;
revoke all on function public.contest_results() from public, anon;
grant execute on function public.contest_results() to authenticated;
