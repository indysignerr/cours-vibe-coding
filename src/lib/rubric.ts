// Grille publique, miroir de RUBRIC.md et de supabase/seed.sql.
// Elle vit dans le repo parce qu'elle doit être lisible sans compte :
// la grille est publiée AVANT chaque concours, toujours.
export type RubricLine = { label: string; hint: string };
export type RubricBlock = {
  label: string;
  weight: number | null; // null pour le portillon éliminatoire
  lines: RubricLine[];
};

export const GATE: RubricBlock = {
  label: "It ships",
  weight: null,
  lines: [
    {
      label: "The live URL opens on a judge phone, first try",
      hint: "No localhost, no video, no screenshot.",
    },
    {
      label: "Nothing blocks the main flow",
      hint: "The one thing the project is for can be done end to end.",
    },
  ],
};

export const BLOCKS: RubricBlock[] = [
  {
    label: "Brief compliance",
    weight: 25,
    lines: [
      {
        label: "One line per constraint of that contest",
        hint: "Never more than three constraints, so each is worth about 8 points. A constraint scored 0 costs its full share.",
      },
    ],
  },
  {
    label: "Design craft",
    weight: 25,
    lines: [
      {
        label: "Typography",
        hint: "A deliberate display and body pairing, a readable hierarchy, no accidental system font.",
      },
      {
        label: "Colour and contrast",
        hint: "A chosen palette rather than framework defaults. Body text passes 4.5 to 1.",
      },
      {
        label: "Composition",
        hint: "Spacing rhythm, alignment, something other than an untouched twelve column grid.",
      },
    ],
  },
  {
    label: "UX and responsive",
    weight: 20,
    lines: [
      {
        label: "Holds at 375 pixels",
        hint: "No horizontal scroll, touch targets at least 44 pixels.",
      },
      {
        label: "The primary action is obvious",
        hint: "One clear thing to do on the first screen, without scrolling.",
      },
      {
        label: "Loading, empty and error states",
        hint: "What happens on a slow network, with no data, and when something fails.",
      },
    ],
  },
  {
    label: "Idea and content",
    weight: 20,
    lines: [
      { label: "The idea answers a real need", hint: "A named person would open this twice." },
      {
        label: "The copy is written",
        hint: "No lorem ipsum, no unedited model output, no filler headline.",
      },
      { label: "We would use it", hint: "The gut check. Judges answer yes or no before justifying." },
    ],
  },
  {
    label: "Ownership",
    weight: 10,
    lines: [
      {
        label: "Thirty seconds of explanation",
        hint: "You can say what the agent built and why, without reading.",
      },
      {
        label: "Clean public repo",
        hint: "Readable commit history, a README, and no secret committed.",
      },
    ],
  },
];

export const SCALE = [
  { value: 0, label: "Absent, ignored, or actively wrong" },
  { value: 1, label: "Attempted, partially there" },
  { value: 2, label: "Done, nothing to add" },
];
