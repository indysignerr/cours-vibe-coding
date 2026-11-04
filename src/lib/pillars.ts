/**
 * Les quatre piliers, tirés du plan annuel 2026/27.
 *
 * Chacun livre une part de la mission. C'est la structure qui explique
 * l'association en un écran : ce qu'on y fait, et pourquoi.
 */
export type Pillar = {
  key: "learn" | "build" | "compete" | "connect";
  title: string;
  verb: string;
  /** La part de mission que ce pilier tient. */
  delivers: string;
  /** Les formats qui l'incarnent. */
  formats: { name: string; what: string; who: string; length: string }[];
};

export const PILLARS: Pillar[] = [
  {
    key: "learn",
    title: "Learn",
    verb: "Master modern developer tools",
    delivers: "The tools nobody teaches you, taught by people who use them.",
    formats: [
      {
        name: "Workshop",
        what: "A deep, hands-on session on one skill, such as LLMs in Python.",
        who: "Open to all",
        length: "Half a day",
      },
      {
        name: "Crash course",
        what: "One topic classes skip: AI coding tools, API keys, Docker, CI/CD, cloud credits.",
        who: "Members",
        length: "Online, one evening",
      },
    ],
  },
  {
    key: "build",
    title: "Build",
    verb: "Build portfolio-ready AI projects",
    delivers: "Something finished, on GitHub, with your name on it.",
    formats: [
      {
        name: "Build Lab",
        what: "Work on your own project, with experienced members helping.",
        who: "Members",
        length: "One hour, every other Tuesday",
      },
    ],
  },
  {
    key: "compete",
    title: "Compete",
    verb: "Prove your skills under pressure",
    delivers: "A deadline, a jury, and a room that is watching.",
    formats: [
      {
        name: "Vibe coding tournament",
        what: "Teams race the clock to build a working app under a theme, using an AI model.",
        who: "Open to all",
        length: "Four to six hours, one Saturday a month",
      },
    ],
  },
  {
    key: "connect",
    title: "Connect",
    verb: "Network with real professionals",
    delivers: "The people you will be working with in two years.",
    formats: [
      {
        name: "Big open events",
        what: "Cinema night, AI discovery days, Demo Day.",
        who: "Open to all",
        length: "Two hours to a full day",
      },
    ],
  },
];
