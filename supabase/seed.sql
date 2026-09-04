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
