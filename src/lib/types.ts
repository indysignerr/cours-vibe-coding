// Types de lignes, alignés sur supabase/007_events.sql.

export type Role = "member" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
};

export type EventRow = {
  slug: string;
  title: string;
  kind: "hackathon" | "workshop" | "talk" | "company";
  starts_at: string;
  ends_at: string;
  location: string | null;
  summary: string | null;
  capacity: number | null;
  is_open: boolean;
};

export type EventSignup = {
  id: string;
  event_slug: string;
  full_name: string;
  email: string;
  organisation: string | null;
  note: string | null;
  created_at: string;
};
