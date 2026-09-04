## Why your neighbour cannot open your page

You double-clicked `index.html` and it looked perfect. Then you sent the address to someone and they got nothing. Look at the address: it starts with `file://`. That is a path on **your** laptop, and nobody else has your laptop.

## Three things that are actually true

**A website is just files.** The starter you downloaded has two: one for the words, one for the look. A giant site is the same idea with more files.

**A URL is a computer that hands those files to whoever asks.** Yours does not do that, and it is closed at night. Cloudflare owns computers that do nothing else, and lets you use them for free.

**Deploying means copying your files onto that computer.** That is the whole mystery. Once you have done it once, "putting something online" stops being a thing other people do.

## The loop you will repeat for twelve weeks

> You describe → the agent writes the files → you copy the files to Cloudflare → a URL exists.

Tonight you do the loop by hand, with a drag and drop. In three weeks, step 03 makes the copy happen by itself every time you save. Same loop, less clicking.

## What Claude Code is, in one sentence

An agent that lives in your terminal, reads the files in the folder you opened it in, and edits them when you ask. It is not a chat window: when it says it changed something, the file on your disk actually changed. Open the file and check, every time, until you trust it.
