// Types de lignes, alignés sur supabase/schema.sql.

export type Role = "student" | "judge" | "admin";
export type ContestStatus = "draft" | "open" | "judging" | "closed";
/** 0 absent · 1 partiel · 2 plein. Trois valeurs, jamais de note sur 10. */
export type ScoreValue = 0 | 1 | 2;

export type Profile = {
  id: string;
  full_name: string;
  github_login: string | null;
  role: Role;
  consent_publish: boolean;
  onboarded_at: string | null;
  created_at: string;
};

export type LeaderboardRow = {
  profile_id: string;
  full_name: string;
  xp: number;
  steps_done: number;
  submissions: number;
  consent_publish: boolean;
};

export type Session = {
  id: string;
  number: number;
  slug: string;
  title: string;
  promise: string;
  concept: string | null;
  held_on: string | null;
  starter_repo: string | null;
  support_md: string | null;
  brief_md: string | null;
  is_unlocked: boolean;
  updated_at: string;
};

export type SessionSolution = {
  session_id: string;
  body_md: string;
  solution_repo: string | null;
  is_unlocked: boolean;
};

export type SessionPrompt = {
  id: string;
  session_id: string;
  position: number;
  label: string | null;
  body: string;
};

export type SessionCheck = {
  id: string;
  session_id: string;
  position: number;
  label: string;
  is_bonus: boolean;
};

export type Rubric = { id: string; name: string; description: string | null; is_default: boolean };

export type RubricGroup = {
  id: string;
  rubric_id: string;
  position: number;
  label: string;
  weight: number;
  is_gate: boolean;
  from_constraints: boolean;
};

export type RubricCriterion = {
  id: string;
  group_id: string;
  position: number;
  label: string;
  hint: string | null;
};

export type Contest = {
  id: string;
  number: number;
  title: string;
  brief_md: string | null;
  rubric_id: string | null;
  announced_at: string | null;
  deadline: string;
  prize_cents: number;
  status: ContestStatus;
};

export type ContestConstraint = { id: string; contest_id: string; position: number; body: string };

export type Submission = {
  id: string;
  contest_id: string;
  profile_id: string;
  title: string;
  live_url: string;
  repo_url: string;
  note: string | null;
  submitted_at: string;
};

export type Score = {
  id: string;
  submission_id: string;
  judge_id: string;
  criterion_id: string | null;
  constraint_id: string | null;
  value: ScoreValue;
};

export type Result = {
  contest_id: string;
  submission_id: string;
  rank: number;
  is_winner: boolean;
  mention: string | null;
  note: string | null;
};
