# Architecture — site de l'asso vibecoding

## Décisions

| Sujet | Choix | Raison |
|---|---|---|
| Rendu | Next.js App Router en `output: "export"`, Cloudflare Pages | contrainte du stack enseigné, hébergement gratuit |
| Contenu public | MDX dans le repo pour accueil, programme, setup, pages légales | indexable par Google, pas de requête pour la page d'accueil |
| Contenu de cours | Supabase, lu côté client après connexion | verrou réel, édition depuis l'admin custom |
| Verrou des séances | RLS sur la table `sessions`, drapeau `is_unlocked` | une séance verrouillée ne quitte jamais la base |
| Auth | Supabase Auth, lien magique par email | pas de mot de passe à gérer, fonctionne en statique |
| Admin | route `/admin`, écrit dans Supabase sous le rôle `admin` | aucune clé de service côté client |

## Le point qui a été arbitré

Deux réponses du cadrage s'opposaient. Le verrou au build suppose que le contenu est
figé à la compilation ; le contenu en base suppose l'inverse. Un verrou au build aurait
imposé un redéploiement complet à chaque déverrouillage, piloté par un webhook, pour un
résultat identique avec plus de pièces mobiles.

Le verrou est donc appliqué par RLS. La garantie est la même, une séance verrouillée
n'est jamais servie au navigateur, et le déverrouillage devient instantané. Voir les
politiques `sessions_read`, `prompts_read` et `checks_read` dans `supabase/schema.sql`.

## Ce que l'auth protège, et ce qu'elle ne protège pas

L'auth identifie les étudiants pour la progression, les rendus et le classement.
Le contenu de séance est protégé par RLS, pas par le fait d'être connecté : un compte
existe, mais il ne voit que les séances déverrouillées. Les pages publiques restent
publiques et doivent le rester, c'est ce qui recrute.

## Séparations volontaires

- `session_solutions` est une table distincte : RLS agit par ligne, pas par colonne, et
  le corrigé se déverrouille après la séance, pas avec elle.
- `public_profiles` est une vue qui n'expose jamais `full_name`, seulement le nom
  d'affichage choisi par l'étudiant.
- Les notes du jury sont invisibles aux candidats jusqu'à la clôture du concours.
