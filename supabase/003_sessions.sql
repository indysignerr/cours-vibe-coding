-- Généré par scripts/sessions-to-sql.mjs. Ne pas éditer à la main.
-- À exécuter après bootstrap.sql. Chaque séance est remplacée entièrement.

begin;

-- ---------- Séance 1 ----------
update public.sessions set support_md = $vcc_md$## Why your neighbour cannot open your page

You double-clicked `index.html` and it looked perfect. Then you sent the address to someone and they got nothing. Look at the address: it starts with `file://`. That is a path on **your** laptop, and nobody else has your laptop.

## Three things that are actually true

**A website is just files.** The starter you downloaded has two: one for the words, one for the look. A giant site is the same idea with more files.

**A URL is a computer that hands those files to whoever asks.** Yours does not do that, and it is closed at night. Cloudflare owns computers that do nothing else, and lets you use them for free.

**Deploying means copying your files onto that computer.** That is the whole mystery. Once you have done it once, "putting something online" stops being a thing other people do.

## The loop you will repeat for twelve weeks

> You describe → the agent writes the files → you copy the files to Cloudflare → a URL exists.

Tonight you do the loop by hand, with a drag and drop. In two weeks, step 03 makes the copy happen by itself every time you save. Same loop, less clicking.

## Before you paste a prompt

Replace everything between < and > with your own words before you press Enter. The agent takes placeholders literally.

## What Claude Code is, in one sentence

An agent that lives in your terminal, reads the files in the folder you opened it in, and edits them when you ask. It is not a chat window: when it says it changed something, the file on your disk actually changed. Open the file and check, every time, until you trust it.$vcc_md$, brief_md = $vcc_md$## What you have at 00:57

A page with your name on it, opened from your own phone, at an address that starts with `https://`.

## Where to start

Download the starter, unzip it, open a terminal **inside that folder** (Mac: type `cd `, drag the folder in, Enter. Windows: type `cmd` in the folder's address bar), then type `claude`.

[Download the starter](/starters/s01-ship-something-live.zip)

## Constraints

- One page only. No menu, no second page. Tonight is about the loop, not the site.
- Your real first name on it, and one thing you actually care about.

## Bonus, if you finish early

Make the page look like it belongs to you and nobody else. No hints. No fix published.

## If you get stuck

1. **`claude: command not found`** → the setup did not finish. Sit with your pair for tonight, and redo the setup step 2 at home.
2. **Cloudflare asks for a project name** → anything lowercase without spaces, it becomes part of your URL. Write it down: you will need it next week.
3. **The page online shows the old version** → it is your browser cache. Hard refresh: Cmd+Shift+R on Mac, Ctrl+Shift+R elsewhere.
4. Raise your hand.$vcc_md$, updated_at = now() where number = 1;
insert into public.session_solutions (session_id, body_md) select id, $vcc_md$## What a good result looks like

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

No git, no framework, no domain. Each of those is a whole step of the path. Tonight the point was that the loop is short, and you own it.$vcc_md$ from public.sessions where number = 1
  on conflict (session_id) do update set body_md = excluded.body_md;
delete from public.session_prompts where session_id = (select id from public.sessions where number = 1);
insert into public.session_prompts (session_id, position, label, body) select id, 1, $vcc_md$Make it mine$vcc_md$, $vcc_md$Read index.html and styles.css. Replace NAME with <your first name> and rewrite the paragraph so it says one true thing about me: <the thing you care about>. Keep it to one page, do not add sections, do not add a menu. Then tell me exactly which lines you changed.$vcc_md$ from public.sessions where number = 1;
insert into public.session_prompts (session_id, position, label, body) select id, 2, $vcc_md$One precise change$vcc_md$, $vcc_md$Change only the background colour of the page to something warm. Do not touch anything else. List the lines you changed.$vcc_md$ from public.sessions where number = 1;
insert into public.session_prompts (session_id, position, label, body) select id, 3, $vcc_md$Check before I deploy$vcc_md$, $vcc_md$I am about to upload this folder to Cloudflare Pages. Check that index.html and styles.css reference each other correctly and that nothing points to a file that does not exist. Answer in three lines maximum.$vcc_md$ from public.sessions where number = 1;
delete from public.session_checks where session_id = (select id from public.sessions where number = 1);
insert into public.session_checks (session_id, position, label, is_bonus) select id, 1, $vcc_md$My page has my first name and one thing I care about$vcc_md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 2, $vcc_md$It opens on my phone at an https:// address$vcc_md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 3, $vcc_md$Someone else in the room opened it on their phone$vcc_md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 4, $vcc_md$I posted the URL in the club group$vcc_md$, false from public.sessions where number = 1;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 5, $vcc_md$Bonus: it looks like it belongs to me and nobody else$vcc_md$, true from public.sessions where number = 1;

-- ---------- Séance 2 ----------
update public.sessions set support_md = $vcc_md$## "Make me a beautiful website"

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

That sequence is the whole skill. The tools will change every year. This will not.$vcc_md$, brief_md = $vcc_md$## What you have at 00:57

The same page as last week, rebuilt in exactly three iterations, back online, with the three prompts you used saved in a file.

## Where to start

Open a terminal in your step 01 folder, type `claude`. Take a screenshot of the page as it is now: that is your "before".

No step 01 folder? Download the step 01 starter, run its first prompt, then continue here.

Re-upload, when you are done: Cloudflare → Workers & Pages → your project → Deployments → Create deployment → drag the folder. Same project, same address.

## Constraints

- **Three prompts that change the page, no more.** One brief, then two single changes. Answering the agent's questions or saying "go ahead" does not count. Write the three in a file called `notes.md` in the folder.
- Each change prompt names one thing and ends with "do not touch anything else".
- No new page, no new tool. Same folder, same Cloudflare project, re-upload.

## Bonus, if you finish early

Ask the agent to critique its own page in five bullet points, then apply exactly one of them.

## If you get stuck

1. **The agent changed things you did not ask for** → you forgot the last sentence. Undo by asking it to put that part back, then restate the constraint.
2. **The result is generic again** → your brief has no named person in it. Add one.
3. **It asks you questions** → answer them. That is the plan step working.
4. Raise your hand.$vcc_md$, updated_at = now() where number = 2;
insert into public.session_solutions (session_id, body_md) select id, $vcc_md$## What a good result looks like

Same page, same address, and three visible differences you can name. A `notes.md` with three prompts where the first one has a person, a job, a definition of done and a "leave this alone" line.

## A brief that worked in the room

> This page is for a recruiter who has thirty seconds. It must make them want to open my GitHub. Done means: my name, one line on what I build, one link, readable on a phone. Do not touch the colours, I like them. Tell me the plan first.

## The two mistakes almost everyone made

Asking for three things in one prompt. The agent does all three, badly, and you cannot tell which one broke the page. Split it.

Skipping the plan. "Just do it" is fine when you know exactly what you want. Tonight you did not, and the plan was where you found out.

## Why this matters more than the tools

Next year the agent will be different. The brief, the plan and the one-change rule will still be how you get good work out of it.$vcc_md$ from public.sessions where number = 2
  on conflict (session_id) do update set body_md = excluded.body_md;
delete from public.session_prompts where session_id = (select id from public.sessions where number = 2);
insert into public.session_prompts (session_id, position, label, body) select id, 1, $vcc_md$The brief$vcc_md$, $vcc_md$Read index.html and styles.css. This page is for <a named person, e.g. a recruiter with thirty seconds>. It must <one job, e.g. make them want to open my GitHub>. Done means: <three checkable things>. Do not touch <the part you already like>. Tell me your plan in five lines and do not change anything yet.$vcc_md$ from public.sessions where number = 2;
insert into public.session_prompts (session_id, position, label, body) select id, 2, $vcc_md$First change$vcc_md$, $vcc_md$Do only step <number> of your plan: <name the change>. Do not touch anything else. When you are done, list the lines you changed.$vcc_md$ from public.sessions where number = 2;
insert into public.session_prompts (session_id, position, label, body) select id, 3, $vcc_md$Second change$vcc_md$, $vcc_md$Now <one precise change, e.g. make the title readable on a phone screen>. Do not touch anything else. List the lines you changed.$vcc_md$ from public.sessions where number = 2;
insert into public.session_prompts (session_id, position, label, body) select id, 4, $vcc_md$Bonus: self-critique$vcc_md$, $vcc_md$Look at the page as if you were the person it is for. Give me five things that would make it better, one line each, most important first. Do not change anything.$vcc_md$ from public.sessions where number = 2;
delete from public.session_checks where session_id = (select id from public.sessions where number = 2);
insert into public.session_checks (session_id, position, label, is_bonus) select id, 1, $vcc_md$My first prompt names a person, a job, what done looks like, and what not to touch$vcc_md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 2, $vcc_md$I rebuilt the page in exactly three prompts, saved in notes.md$vcc_md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 3, $vcc_md$The page is back online at the same address$vcc_md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 4, $vcc_md$I posted a before and after screenshot in the club group$vcc_md$, false from public.sessions where number = 2;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 5, $vcc_md$Bonus: I applied one point from the agent's own critique$vcc_md$, true from public.sessions where number = 2;

-- ---------- Séance 3 ----------
update public.sessions set support_md = $vcc_md$## The version from two minutes ago is nowhere

You asked for a big redesign, the agent rewrote every file, and the result is broken. Undo does nothing, because these are not keystrokes, they are files that were replaced. Claude Code keeps checkpoints while its window is open, and they vanish when you close it. Without a safety net that lives in the project itself, the only way back is memory.

## A commit is a named save point

Exactly like saving a game before a boss. You save, you try the risky thing, and if it goes wrong you load the save. You make one before anything risky, which with an agent means constantly. A commit has a message, so your future self knows what "before" was.

## Going back is a command, not a drama

- `git restore .` throws away everything you changed since the last save.
- `git revert` undoes a save you already made, and records that you did.

Nothing is ever lost. That is the contract, and it changes how brave you can be with an agent.

## Push means: send your saves to GitHub

A commit lives on your laptop. Push copies it to GitHub. Pull brings back what is there. Three words, that is all the vocabulary tonight needs.

## GitHub is the copy elsewhere, and your portfolio

Your laptop can die tonight. GitHub keeps the history somewhere else. And a recruiter opening your profile sees dated commits with real messages, which is evidence, not a claim.

## The loop gets shorter tonight

> You describe → the agent writes → you commit → you push → Cloudflare deploys by itself.

No more drag and drop. Save, push, done. From now on every step of this path ends with a push.

## Let the agent run git, but read what it does

"Commit this with a clear message" works. So does "undo the last change but keep the title". Always read the commands it proposes before saying yes. Git will not delete your work, but you should still know what it is doing with it.$vcc_md$, brief_md = $vcc_md$## What you have at 00:57

Your project on GitHub with at least two commits and a readable message on each, and one visible undo.

## Where to start

Open a terminal in your step 02 folder, type `claude`. Your first prompt turns the folder into a repository and makes the first save.

You did the three "before step 03" items on the Setup page, at home. If not, sit with your pair tonight.

No step 02 folder? Download the step 01 starter, run its first prompt, then continue here.

## Constraints

- **Save before you break.** Your first commit happens before any change tonight.
- **Break it on purpose once**, then get back. Either commit the breakage and `git revert` it, so the undo shows in the history, or `git restore .` and paste the command in `notes.md`.

## Bonus, if you finish early

Connect Cloudflare to the repository: Create → Pages → Connect to Git → a **new** project (your old name is taken, your URL changes tonight, that is fine). Build command empty, output directory `/`. Then push once and watch it deploy itself.

## If you get stuck

1. **`fatal: not a git repository`** → your terminal is in the wrong folder. `cd` into the project folder and try again.
2. **Please tell me who you are** → run `git config --global user.name "Your Name"` then the same with `user.email`.
3. **`git push` is refused** → GitHub does not know your laptop yet. Run `gh auth login` and follow the prompts, then push again.
4. Raise your hand.$vcc_md$, updated_at = now() where number = 3;
insert into public.session_solutions (session_id, body_md) select id, $vcc_md$## What a good result looks like

A GitHub repository with a readable history: "Page after step 02", "Add a dark theme", "Revert dark theme". Two commits and an undo is a full score. Cloudflare connected to the repository is the bonus.

## The exact steps, for the record

1. `git init -b main`, `git add .`, `git commit -m "Page after step 02"`. If git asks who you are, set your name and email once with `git config --global`.
2. Break something big. `git restore .` to get back, or commit it and `git revert HEAD`.
3. Create an empty repository on GitHub, then `git remote add origin <url>` and `git push -u origin main`.
4. Bonus: Cloudflare → Create → Pages → Connect to Git → a new project on your repository. No build command, output directory `/`.
5. Bonus: change one word, commit, push. Watch the deployment happen without you.

## The two mistakes almost everyone made

Committing after breaking instead of before. The save has to exist before the risk, or it saves the broken state.

Committing everything as "update". In two weeks you will not know which save is which. Say what changed.

## Why the agent made this easier, not harder

It ran the commands for you. But the ones who read the commands before saying yes were the ones who could explain their history at the end. Those are the Ownership points, in every contest from next week on.$vcc_md$ from public.sessions where number = 3
  on conflict (session_id) do update set body_md = excluded.body_md;
delete from public.session_prompts where session_id = (select id from public.sessions where number = 3);
insert into public.session_prompts (session_id, position, label, body) select id, 1, $vcc_md$First save$vcc_md$, $vcc_md$Turn this folder into a git repository on a branch called main and make a first commit with the message "Page after step 02". Show me the commands before running them, then run them and show me git log.$vcc_md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 2, $vcc_md$Break it on purpose$vcc_md$, $vcc_md$Redesign the whole page with a dark theme and a menu. Do it, I want to see it broken.$vcc_md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 3, $vcc_md$Get back$vcc_md$, $vcc_md$Get me back to the last commit. Show me the command before running it, and tell me whether it will show in the history or not.$vcc_md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 4, $vcc_md$Push to GitHub$vcc_md$, $vcc_md$I created an empty repository at <url>. Connect this folder to it and push. Show me each command before running it. If authentication fails, tell me exactly what to type.$vcc_md$ from public.sessions where number = 3;
insert into public.session_prompts (session_id, position, label, body) select id, 5, $vcc_md$A real change, saved$vcc_md$, $vcc_md$Change <one precise thing>. Then commit it with a message that says what changed, in plain words, and push.$vcc_md$ from public.sessions where number = 3;
delete from public.session_checks where session_id = (select id from public.sessions where number = 3);
insert into public.session_checks (session_id, position, label, is_bonus) select id, 1, $vcc_md$My repository is on GitHub with at least two commits and a readable message on each$vcc_md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 2, $vcc_md$One undo is visible: a revert in the history, or the restore command in notes.md$vcc_md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 3, $vcc_md$I can say in one sentence what a commit is$vcc_md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 4, $vcc_md$I posted the repository link in the club group$vcc_md$, false from public.sessions where number = 3;
insert into public.session_checks (session_id, position, label, is_bonus) select id, 5, $vcc_md$Bonus: Cloudflare is connected to the repository and deployed my last push by itself$vcc_md$, true from public.sessions where number = 3;

commit;
