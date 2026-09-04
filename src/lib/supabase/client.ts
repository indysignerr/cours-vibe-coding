import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Le site est exporté en statique : toute lecture passe par le navigateur,
// sous l'identité de l'étudiant connecté. Le verrou des séances est donc
// appliqué par les politiques RLS, jamais par ce fichier.
let cached: SupabaseClient | null = null;

/**
 * Normalise l'URL du projet. Une valeur collée sans schéma est l'erreur la
 * plus fréquente côté Cloudflare, et elle faisait tomber la page entière :
 * on la répare ici au lieu de laisser createClient jeter.
 */
function normalizeUrl(raw: string | undefined): string | null {
  const value = raw?.trim().replace(/\/+$/, "");
  if (!value) return null;

  const candidates = /^https?:\/\//i.test(value) ? [value] : [`https://${value}`];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      const usableProtocol = url.protocol === "https:" || url.protocol === "http:";
      // Un hôte sans point n'est jamais un projet Supabase : on le rejette
      // pour que le diagnostic s'affiche au lieu d'un échec réseau opaque.
      if (usableProtocol && url.hostname.includes(".")) return url.origin;
    } catch {
      // essai suivant
    }
  }
  return null;
}

function readEnv() {
  return {
    url: normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    key: (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      ""
    ).trim(),
  };
}

/**
 * Tant que la configuration n'est pas exploitable, les pages affichent un
 * état explicite au lieu de casser. Aucune page ne doit appeler getSupabase
 * sans avoir testé ceci d'abord.
 */
export function isSupabaseConfigured(): boolean {
  const { url, key } = readEnv();
  return Boolean(url && key);
}

/**
 * Décrit ce qui manque, pour que la prochaine panne de configuration soit
 * lisible en trente secondes au lieu d'une page blanche.
 */
export function configurationProblem(): string | null {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const { url, key } = readEnv();

  if (!rawUrl) return "NEXT_PUBLIC_SUPABASE_URL is not set.";
  if (!url) {
    return "NEXT_PUBLIC_SUPABASE_URL is not a usable address. It has to look like https://<project>.supabase.co";
  }
  if (!key) return "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set.";
  return null;
}

export function getSupabase(): SupabaseClient {
  if (cached) return cached;

  const { url, key } = readEnv();
  if (!url || !key) {
    throw new Error(configurationProblem() ?? "Supabase is not configured.");
  }

  cached = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return cached;
}
