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
