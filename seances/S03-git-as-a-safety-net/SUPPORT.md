## The version from two minutes ago is nowhere

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

"Commit this with a clear message" works. So does "undo the last change but keep the title". Always read the commands it proposes before saying yes. Git will not delete your work, but you should still know what it is doing with it.
