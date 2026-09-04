import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Le site est exporté en statique : toute lecture passe par le navigateur,
// sous l'identité de l'étudiant connecté. Le verrou des séances est donc
// appliqué par les politiques RLS, jamais par ce fichier.
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY manquent. Copier .env.example vers .env.local."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return cached;
}
