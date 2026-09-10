## What a good result looks like

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

It ran the commands for you. But the ones who read the commands before saying yes were the ones who could explain their history at the end. Those are the Ownership points, in every contest from next week on.
