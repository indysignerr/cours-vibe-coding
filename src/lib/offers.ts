/**
 * Le catalogue, en un seul endroit.
 *
 * La page d'accueil n'affiche que `summary`, la page Services déplie le
 * reste. Les prix sont des forfaits : jamais de régie sur les premières
 * missions, acompte de 30 % à la signature.
 *
 * Source : junior/OFFRES.md. Si un prix bouge, il bouge ici et dans le
 * document, nulle part ailleurs.
 */
export type Offer = {
  n: string;
  slug: string;
  title: string;
  price: string;
  duration: string;
  summary: string;
  delivers: string[];
  why: string;
  excludes: string;
  market?: string;
};

export const OFFERS: Offer[] = [
  {
    n: "01",
    slug: "audit",
    title: "AI audit and compliance file",
    price: "€2,500",
    duration: "Three weeks · four half-days",
    summary:
      "A map of the AI already running in your company, ten repetitive tasks timed, your data sorted — and the file that lets you prove it.",
    delivers: [
      "A map of the AI tools already running in your company, declared or not. There are always some, and directors are always surprised.",
      "Ten repetitive tasks, timed, ranked by gain and by risk.",
      "Your data sorted into four categories — public, internal, personal, sensitive — process by process.",
      "The file: processing register, retention periods including conversation histories, information notice, internal usage policy, and the state of your works-council consultation.",
      "A written recommendation on the three processes to treat first, and the ones not to touch.",
    ],
    why:
      "No access to your systems, no personal data processed, nothing to maintain afterwards. It is also what small companies actually lack: not a model, a file they can show to an inspection.",
    excludes:
      "Implementation, staff training, a full impact assessment, any access to your software, and any certification of compliance — which we never issue.",
  },
  {
    n: "02",
    slug: "workplace",
    title: "Workplace-ready AI",
    price: "€3,000",
    duration: "Three weeks",
    market: "Built for the Italian market",
    summary:
      "The dossier that unblocks a deployment touching employees, under Italian labour law.",
    delivers: [
      "Qualification of the tool under article 4 of the Statuto dei Lavoratori: ordinary work tool, or instrument capable of remote monitoring.",
      "Preparation of the agreement with union representatives, or of the labour inspectorate authorisation filing.",
      "The information notice required by the transparency decree, covering the logic of the system and its training parameters.",
      "The human-oversight note required by the 2025 Italian AI law.",
      "The processor register and the processing agreement.",
      "Staff training material, which the law makes compulsory.",
    ],
    why:
      "Breaching article 4 is a criminal matter, and the evidence it produces cannot be used. The freelancer wiring an agent onto HR data has not read that text.",
    excludes:
      "The union negotiation itself, representation before the inspectorate, and any certification of compliance.",
  },
  {
    n: "03",
    slug: "assistant",
    title: "An assistant on your documents",
    price: "€3,500",
    duration: "Three weeks",
    summary:
      "An internal assistant that answers from your own documents and cites its source every time.",
    delivers: [
      "An internal assistant that answers your teams from your own documents — procedures, catalogues, standard contracts — with the source cited on every answer.",
      "Hosted on a European interface under a processing agreement by default. On your own machines when your data demands it; the hardening is quoted separately.",
      "A closed scope, agreed in writing before we index anything.",
    ],
    why:
      "The scope is what makes it safe: your documents, a closed perimeter, no personal data in the index.",
    excludes:
      "Hosting beyond the first year, adding documents after acceptance, translation, and connectors into a line-of-business system.",
  },
  {
    n: "04",
    slug: "internal-tool",
    title: "The tool that replaces a spreadsheet",
    price: "€4,500",
    duration: "Three weeks",
    summary:
      "A web application for one process. You own the code and the accounts from day one.",
    delivers: [
      "A web application for one precise process: request tracking, field entry, scheduling, a dashboard.",
      "Accounts for your team, and the code and the accounts in your name from day one.",
      "Handover documentation written for someone who was not in the room.",
    ],
    why:
      "This is development, not prediction. Every result is verifiable line by line.",
    excludes:
      "Migrating historical data, changes after acceptance, a native mobile application, and integration with an existing system.",
  },
  {
    n: "05",
    slug: "automation",
    title: "Automating one chain of steps",
    price: "€2,500",
    duration: "Two to three weeks, depending on access",
    summary:
      "One scenario linking two tools you already pay for. The manual re-entry stops.",
    delivers: [
      "One scenario linking two tools you already pay for, removing a recurring manual re-entry.",
      "The scenario runs on your own instance, under your own licence. We bill the implementation, never the hosting.",
      "Handover documentation, so your team can change it without us.",
    ],
    why:
      "On your instance, a failure on our side never stops your production, and the end of the engagement is clean.",
    excludes:
      "Maintaining the scenario, third-party API changes, and error cases not identified during scoping.",
  },
];
