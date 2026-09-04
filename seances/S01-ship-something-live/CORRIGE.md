## What a good result looks like

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

No git, no framework, no domain. Each of those is a whole step of the path. Tonight the point was that the loop is short, and you own it.
