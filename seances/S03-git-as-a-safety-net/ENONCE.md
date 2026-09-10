## What you have at 00:57

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
4. Raise your hand.
