## What you have at 00:57

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
4. Raise your hand.
