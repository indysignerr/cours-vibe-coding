# Judging grid — website or app

Published before every contest, never after. Students score themselves with it
before they submit.

## The gate — it ships

Pass or fail. No points, but a failed gate ends the evaluation.

| # | Line |
|---|---|
| 1 | The live URL opens on a judge phone, first try. No localhost, no video, no screenshot. |
| 2 | Nothing blocks the main flow. The one thing the project is for can be done end to end. |

A project that does not open is not judged. This is the most important rule of the
whole programme: shipping is the subject.

## The five scored groups — 100 points

Every line is scored **0, 1 or 2**. Nothing else. Three values kill the half point
argument and cut deliberation time in half.

- **0** absent, ignored, or actively wrong
- **1** attempted, partially there
- **2** done, nothing to add

A group score is `sum of its lines / (2 × number of lines) × group weight`.

### Brief compliance — 25 points

One line per constraint of that contest, generated automatically from the brief.
A constraint scored 0 costs its full share. There are never more than three
constraints, so each is worth roughly 8 points.

### Design craft — 25 points

| Line | What the judge looks at |
|---|---|
| Typography | A deliberate display and body pairing, a readable hierarchy, no accidental system font. |
| Colour and contrast | A chosen palette rather than framework defaults. Body text passes 4.5 to 1. |
| Composition | Spacing rhythm, alignment, something other than an untouched twelve column grid. |

### UX and responsive — 20 points

| Line | What the judge looks at |
|---|---|
| Holds at 375 pixels | No horizontal scroll, touch targets at least 44 pixels. |
| The primary action is obvious | One clear thing to do on the first screen, without scrolling. |
| Loading, empty and error states | What happens on a slow network, with no data, and when something fails. |

### Idea and content — 20 points

| Line | What the judge looks at |
|---|---|
| The idea answers a real need | A named person would open this twice. |
| The copy is written | No lorem ipsum, no unedited model output, no filler headline. |
| We would use it | The gut check. Judges answer yes or no before justifying. |

### Ownership — 10 points

| Line | What the judge looks at |
|---|---|
| Thirty seconds of explanation | The student can say what the agent built and why, without reading. |
| Clean public repo | Readable commit history, a README, and no secret committed. |

Using an agent is the subject of this club, never cheating. The only fraud
possible is submitting someone else work. A single giant commit is not
forbidden, it just raises the Ownership question.

## Protocol for two judges

1. Each judge scores alone, in the admin, without seeing the other scores. The
   database enforces this.
2. Totals are averaged.
3. A gap wider than 15 points on the same project is the only thing discussed.
4. **Tie break, in this order:** higher Design craft, then higher Idea and
   content, then the two judges argue it out. With an even number of judges a
   deterministic rule has to exist before the contest, not after.

## What gets published

The winner, the three constraints they held best, and **one sentence on every
project submitted**. A student who is mentioned nowhere does not enter again.
