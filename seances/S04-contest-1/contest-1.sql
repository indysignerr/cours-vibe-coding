-- Concours 1 : brief, contraintes, ouverture. À exécuter le jour J, à l'annonce.
-- L'admin du site sait aussi le faire ; ceci est le repli SQL.
begin;
update public.contests set
  brief_md = $md$## A landing page under constraints

For a real student initiative at Albert School, existing or invented, with a named person it is for. Zero images, not even an icon. Everything in under 80 words.

Frozen at full marks this time: "Holds at 375 pixels" and "Loading, empty and error states". The gate still applies.$md$,
  announced_at = now(),
  status = 'open'
where number = 1;

delete from public.contest_constraints where contest_id = (select id from public.contests where number = 1);
insert into public.contest_constraints (contest_id, position, body)
select id, 1, 'A landing page for a real student initiative at Albert School, with a named person it is for.' from public.contests where number = 1
union all select id, 2, 'Zero images. Type, colour and layout only. Not even an icon.' from public.contests where number = 1
union all select id, 3, 'Everything in under 80 words.' from public.contests where number = 1;
commit;

-- À 23:59 le jour J : update public.contests set status = 'judging' where number = 1;
-- Après délibération et publication des résultats : status = 'closed'.
