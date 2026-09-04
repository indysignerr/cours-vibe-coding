import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Le site est exporté en statique : toute lecture passe par le navigateur,
// sous l'identité de l'étudiant connecté. Le verrou des séances est donc
// appliqué par les politiques RLS, jamais par ce fichier.
let cached: SupabaseClient | null = null;

function readEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/**
 * Tant que le projet Supabase n'existe pas, les pages affichent un état
 * explicite au lieu de casser. Aucune page ne doit appeler getSupabase
 * sans avoir testé ceci d'abord.
 */
export function isSupabaseConfigured(): boolean {
  const { url, key } = readEnv();
  return Boolean(url && key);
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const { url, key } = readEnv();

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquent. Copier .env.example vers .env.local."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return cached;
}
