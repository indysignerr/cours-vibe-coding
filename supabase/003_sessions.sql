-- Généré par scripts/sessions-to-sql.mjs. Ne pas éditer à la main.
-- À exécuter après bootstrap.sql. Chaque séance est remplacée entièrement.

begin;

-- ---------- Séance 1 ----------
update public.sessions set support_md = $md$## Why your neighbour cannot open your page

You double-clicked `index.html` and it looked perfect. Then you sent the address to someone and they got nothing. Look at the address: it starts with `file://`. That is a path on **your** laptop, and nobody else has your laptop.

## Three things that are actually true

**A website is just files.** The starter you downloaded has two: one for the words, one for the look. A giant site is the same idea with more files.

**A URL is a computer that hands those files to whoever asks.** Yours does not do that, and it is closed at night. Cloudflare owns computers that do nothing else, and lets you use them for free.

**Deploying means copying your files onto that computer.** That is the whole mystery. Once you have done it once, "putting something online" stops being a thing other people do.

## The loop you will repeat for twelve weeks

> You describe → the agent writes the files → you copy the files to Cloudflare → a URL exists.

Tonight you do the loop by hand, with a drag and drop. In three weeks, step 03 makes the copy happen by itself every time you save. Same loop, less clicking.

## What Claude Code is, in one sentence

An agent that lives in your terminal, reads the files in the folder you opened it in, and edits them when you ask. It is not a chat window: when it says it changed something, the file on your disk actually changed. Open the file and check, every time, until you trust it.$md$, brief_md = $md$## What you have at 00:57

A page with your name on it, opened from your own phone, at an address that starts with `https://`.

## Done means

Every line below is something another person can check without reading your code.

## Where to start

Download the starter, unzip it, open a terminal **inside that folder**, type `claude`.

[Download the starter](/starters/s01-ship-something-live.zip)

## Constraints

- One page only. No menu, no second page. Tonight is about the loop, not the site.
- Your real first name on it, and one thing you actually care about.

## Bonus, if you finish early

Make the page look like it belongs to you and nobody else. No hints. No fix published.

## If you get stuck

1. **`claude: command not found`** → the setup did not finish. Sit with your pair for tonight, and redo the setup step 2 at home.
2. **Cloudflare asks for a project name** → anything lowercase without spaces, it becomes part of your URL.
3. **The page online shows the old version** → it is your browser cache. Hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R elsewhere.
4. Raise your hand.$md$, updated_at = now() where number = 1;
insert into public.session_solutions (session_id, body_md) select id, $md$## What a good result looks like

A URL like `https://something.pages.dev` that opens on a phone, with your name in the title and one sentence that could only be written by you. That is a full score for step 01.

## The exact steps, for the record

1. Unzip the starter. Open a terminal in that folder. Type `claude`.
2. Give it the first prompt from this page, with your own name and interest.
3. Open `index.html` in a browser and read what changed. If you dislike something, say precisely what, in one sentence.
4. Cloudflare dashboard → Workers & Pages → Create → Pages → Upload assets. Name the project. Drag the whole folder in.
5. Wait for the green tick, open the URL on your phone, post it in the group.

## The two mistakes almost everyone made

Sending a `file://` address. It only works on your own machine.

Uploading a single file instead of the folder. Cloudflare needs both `index.html` and `styles.css`, so drag the folder.

## What we did not do on purpose

No git, no framework, no domain. Each of those is a whole step of the path. Tonight the point was that the loop is short, and you own it.$md$ from public.sessions where number = 1
  on conflict (session_id) do update set body_md = excluded.body_md;
delete from public.session_prompts where session_id = (select id from public.sessions where number = 1);
insert into public.session_prompts (session_id, position, label, body) select id, 1, $md$Make it mine$md$, $md$Read index.html and styles.css. Replace NAME with "<your first name>" and rewrite the paragraph so it says one true thing about me: <the thing you care about>. Keep it to one page, do not add sections, do not add a menu. Then tell me exactly which lines you changed.$md$ from public.sessions where number = 1;
insert into public.session_prompts (session_id, position, label, body) select id, 2, $md$One precise change$md$, $md$Change only the background colour of the page to something warm, and make the title bigger. Do not touch anything else. List the lines you changed.$md$ from public.sessions where number = 1;
insert into public.session_prompts (session_id, position, label, body) select id, 3, $md$Check before I deploy$md$, $md$I am about to upload this folder to Cloudflare Pages. Check that index.html and styles.css reference each other correctly and that nothing points to a file that does not exist. Answer in three lines maximum.$md$ from public.sessions where number = 1;
delete from public.session_checks where session_id = (select id from public.sessions where number = 1);
insert into public.session_checks (session_id, position, label, is_bonus) select id, 1, $md$My page has my first name and one thing I care about$md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 2, $md$It opens on my phone at an https:// address$md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 3, $md$Someone else in the room opened it on their phone$md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 4, $md$I posted the URL in the club group$md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 5, $md$Bonus: it looks like it belongs to me and nobody else$md$, true from public.sessions where number = 1;

-- ---------- Séance 2 ----------
update public.sessions set support_md = $md$## "Make me a beautiful website"

You saw what that produces: a blue hero, three cards, a font you have seen a thousand times. It is not the agent being bad. It is the agent being asked nothing.

## The agent knows nothing about you

Not who the page is for, not what it should do, not what "good" means to you, not what it must leave alone. Every one of those gaps gets filled with the most average answer on the internet. A brief closes the gaps in four lines:

- **Who it is for.** A named person, not "users".
- **What it must do.** One job.
- **What done looks like.** Something you can check.
- **What not to touch.** The part you already like.

## Ask for the plan before the code

> "Tell me what you would change, and do not change anything yet."

Now you correct one sentence instead of a hundred lines. The plan is where you catch "I would also add a contact form" before it exists.

## Iterate, never restart

One change per prompt. Name it. End with "do not touch anything else". Then look at exactly that part. Three small iterations beat one big reset every single time, because you keep everything that already worked.

## The sequence, on one line

> Wish → brief → plan → one change → one change → one change.

That sequence is the whole skill. The tools will change every year. This will not.$md$, brief_md = $md$## What you have at 00:57

The same page as last week, rebuilt in exactly three iterations, back online, with the three prompts you used saved in a file.

## Where to start

Open a terminal in your step 01 folder, type `claude`. Take a screenshot of the page as it is now: that is your "before".

## Constraints

- **Three prompts, no more.** One brief, then two single changes. Write them in a file called `notes.md` in the folder.
- Each change prompt names one thing and ends with "do not touch anything else".
- No new page, no new tool. Same folder, same Cloudflare project, re-upload.

## Bonus, if you finish early

Ask the agent to critique its own page in five bullet points, then apply exactly one of them.

## If you get stuck

1. **The agent changed things you did not ask for** → you forgot the last sentence. Undo by asking it to put that part back, then restate the constraint.
2. **The result is generic again** → your brief has no named person in it. Add one.
3. **It asks you questions** → answer them. That is the plan step working.
4. Raise your hand.$md$, updated_at = now() where number = 2;
insert into public.session_solutions (session_id, body_md) select id, $md$## What a good result looks like

Same page, same address, and three visible differences you can name. A `notes.md` with three prompts where the first one has a person, a job, a definition of done and a "leave this alone" line.

## A brief that worked in the room

> This page is for a recruiter who has thirty seconds. It must make them want to open my GitHub. Done means: my name, one line on what I build, one link, readable on a phone. Do not touch the colours, I like them. Tell me the plan first.

## The two mistakes almost everyone made

Asking for three things in one prompt. The agent does all three, badly, and you cannot tell which one broke the page. Split it.

Skipping the plan. "Just do it" is fine when you know exactly what you want. Tonight you did not, and the plan was where you found out.

## Why this matters more than the tools

Next year the agent will be different. The brief, the plan and the one-change rule will still be how you get good work out of it.$md$ from public.sessions where number = 2
  on conflict (session_id) do update set body_md = excluded.body_md;
delete from public.session_prompts where session_id = (select id from public.sessions where number = 2);
insert into public.session_prompts (session_id, position, label, body) select id, 1, $md$The brief$md$, $md$Read index.html and styles.css. This page is for <a named person, e.g. a recruiter with thirty seconds>. It must <one job, e.g. make them want to open my GitHub>. Done means: <three checkable things>. Do not touch <the part you already like>. Tell me your plan in five lines and do not change anything yet.$md$ from public.sessions where number = 2;
insert into public.session_prompts (session_id, position, label, body) select id, 2, $md$First change$md$, $md$Do only step <number> of your plan: <name the change>. Do not touch anything else. When you are done, list the lines you changed.$md$ from public.sessions where number = 2;
insert into public.session_prompts (session_id, position, label, body) select id, 3, $md$Second change$md$, $md$Now <one precise change, e.g. make the title readable on a phone screen>. Do not touch anything else. List the lines you changed.$md$ from public.sessions where number = 2;
insert into public.session_prompts (session_id, position, label, body) select id, 4, $md$Bonus: self-critique$md$, $md$Look at the page as if you were the person it is for. Give me five things that would make it better, one line each, most important first. Do not change anything.$md$ from public.sessions where number = 2;
delete from public.session_checks where session_id = (select id from public.sessions where number = 2);
insert into public.session_checks (session_id, position, label, is_bonus) select id, 1, $md$My first prompt names a person, a job, what done looks like, and what not to touch$md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 2, $md$I rebuilt the page in exactly three prompts, saved in notes.md$md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 3, $md$The page is back online at the same address$md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 4, $md$I posted a before and after screenshot in the club group$md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 5, $md$Bonus: I applied one point from the agent's own critique$md$, true from public.sessions where number = 2;

-- ---------- Séance 3 ----------
update public.sessions set support_md = $md$## The version from two minutes ago is nowhere

You asked for a big redesign, the agent rewrote every file, and the result is broken. Undo does nothing, because these are not keystrokes, they are files that were replaced. Without a safety net, the only way back is memory.

## A commit is a named save point

Exactly like saving a game before a boss. You save, you try the risky thing, and if it goes wrong you load the save. You make one before anything risky, which with an agent means constantly. A commit has a message, so your future self knows what "before" was.

## Going back is a command, not a drama

- `git restore .` throws away everything you changed since the last save.
- `git revert` undoes a save you already made, and records that you did.

Nothing is ever lost. That is the contract, and it changes how brave you can be with an agent.

## GitHub is the copy elsewhere, and your portfolio

Your laptop can die tonight. GitHub keeps the history somewhere else. And a recruiter opening your profile sees dated commits with real messages, which is evidence, not a claim.

## The loop gets shorter tonight

> You describe → the agent writes → you commit → you push → Cloudflare deploys by itself.

No more drag and drop. Save, push, done. From now on every step of this path ends with a push.

## Let the agent run git, but read what it does

"Commit this with a clear message" works. So does "undo the last change but keep the title". Always read the commands it proposes before saying yes. Git will not delete your work, but you should still know what it is doing with it.$md$, brief_md = $md$## What you have at 00:57

Your project on GitHub with at least three commits, one visible undo in the history, and Cloudflare redeploying by itself every time you push.

## Where to start

Open a terminal in your step 02 folder, type `claude`. Your first prompt turns the folder into a repository and makes the first save.

## Constraints

- **Save before you break.** Your first commit happens before any change tonight.
- **Break it on purpose once**, then get back with a restore or a revert. The undo must be visible in the history or in your notes.
- Cloudflare connected to the repository, not a manual upload.

## Bonus, if you finish early

Make a branch, try something wild on it, and merge it only if you like it.

## If you get stuck

1. **`fatal: not a git repository`** → your terminal is in the wrong folder. `cd` into the project folder and try again.
2. **`git push` is refused** → GitHub does not know your laptop yet. Run `gh auth login` and follow the prompts, then push again.
3. **Cloudflare deploys but the page is blank** → the output directory should be `/` and the build command empty for a plain folder.
4. Raise your hand.$md$, updated_at = now() where number = 3;
insert into public.session_solutions (session_id, body_md) select id, $md$## What a good result looks like

A GitHub repository with a readable history: "Page after step 02", "Add a dark theme", "Revert dark theme", "Fix the title". A Cloudflare project that shows the repository name and a green deployment for the last commit.

## The exact steps, for the record

1. `git init`, `git add .`, `git commit -m "Page after step 02"`.
2. Break something big. `git restore .` to get back, or commit it and `git revert HEAD`.
3. Create an empty repository on GitHub, then `git remote add origin <url>` and `git push -u origin main`.
4. Cloudflare → Create → Pages → Connect to Git → your repository. No build command, output directory `/`.
5. Change one word, commit, push. Watch the deployment happen without you.

## The two mistakes almost everyone made

Committing after breaking instead of before. The save has to exist before the risk, or it saves the broken state.

Committing everything as "update". In two weeks you will not know which save is which. Say what changed.

## Why the agent made this easier, not harder

It ran the commands for you. But the ones who read the commands before saying yes were the ones who could explain their history at the end. That is the ownership points of every contest, starting next week.$md$ from public.sessions where number = 3
  on conflict (session_id) do update set body_md = excluded.body_md;
delete from public.session_prompts where session_id = (select id from public.sessions where number = 3);
insert into public.session_prompts (session_id, position, label, body) select id, 1, $md$First save$md$, $md$Turn this folder into a git repository and make a first commit with the message "Page after step 02". Show me the commands before running them, then run them and show me git log.$md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 2, $md$Break it, then get back$md$, $md$Redesign the whole page with a dark theme and a menu. Then show me how to get back to the last commit without losing the commit history, and do it.$md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 3, $md$Push to GitHub$md$, $md$I created an empty repository at <url>. Connect this folder to it and push. Show me each command before running it. If authentication fails, tell me exactly what to type.$md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 4, $md$A real change, saved$md$, $md$Change <one precise thing>. Then commit it with a message that says what changed, in plain words, and push.$md$ from public.sessions where number = 3;
delete from public.session_checks where session_id = (select id from public.sessions where number = 3);
insert into public.session_checks (session_id, position, label, is_bonus) select id, 1, $md$My repository is on GitHub with at least three commits$md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 2, $md$One undo is visible: a restore in my notes or a revert in the history$md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 3, $md$Cloudflare is connected to the repository and deployed my last push by itself$md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 4, $md$I posted the repository link and the live URL in the club group$md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 5, $md$Bonus: I tried something on a branch and merged it$md$, true from public.sessions where number = 3;

commit;
