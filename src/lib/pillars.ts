/**
 * Les quatre piliers, et les cinq formats, tels que le plan annuel les
 * écrit.
 *
 * RÈGLE DE CE FICHIER : chaque chaîne vient de la table « What we offer »
 * du plan. Les descriptions que j'avais rédigées à côté ont été
 * supprimées — elles se lisaient comme des faits.
 *
 * Une réserve honnête : la table des formats donne les tournois comme
 * « Open », tandis que le calendrier les donne « Members ». Le plan se
 * contredit. Le site suit le calendrier, qui est plus récent et plus
 * précis, et la table n'affiche donc plus de public par format.
 */
export type Pillar = {
  key: "learn" | "build" | "compete" | "connect";
  title: string;
  /** La phrase du plan : « Learn to master modern developer tools », etc. */
  verb: string;
  /** Les formats qui l'incarnent, dans les mots du plan. */
  formats: { name: string; what: string; length: string }[];
};

export const PILLARS: Pillar[] = [
  {
    key: "learn",
    title: "Learn",
    verb: "Master modern developer tools",
    formats: [
      {
        name: "Workshop",
        what: "A deep, hands-on session on one skill, such as LLMs in Python.",
        length: "Half a day",
      },
      {
        name: "Crash course",
        what: "One topic classes skip: an AI coding tools speedrun, API keys, Docker, CI/CD, cloud credits.",
        length: "Online",
      },
    ],
  },
  {
    key: "build",
    title: "Build",
    verb: "Build portfolio-ready AI projects",
    formats: [
      {
        name: "Build Lab",
        what: "Work on your own tech projects, with experienced members helping.",
        length: "An hour, every other Tuesday",
      },
    ],
  },
  {
    key: "compete",
    title: "Compete",
    verb: "Prove your skills under pressure",
    formats: [
      {
        name: "Vibe coding tournament",
        what: "Teams race the clock to build a working app or platform under a theme.",
        length: "Four to six hours, on a Saturday",
      },
    ],
  },
  {
    key: "connect",
    title: "Connect",
    verb: "Network with real professionals",
    formats: [
      {
        name: "Big open events",
        what: "Cinema night, AI discovery days, Demo Day.",
        length: "Two hours to a day",
      },
    ],
  },
];
