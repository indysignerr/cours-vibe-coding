// Types de lignes, alignés sur le schéma Supabase (supabase/bootstrap.sql).

export type Role = "member" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  role: Role;
  created_at: string;
};
