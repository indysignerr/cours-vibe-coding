# Supabase, avant le déploiement Cloudflare

Ordre à respecter. Les étapes 1 à 6 se font avant Cloudflare, l'étape 8
seulement après le premier déploiement, parce qu'elle a besoin de l'URL.

---

## 1. Créer le projet

Région : **une région européenne**, Francfort ou Paris. Vous stockez des
prénoms et des noms d'étudiants, la donnée reste dans l'UE.

Le mot de passe base de données est à ranger dans un gestionnaire de mots de
passe. Le site ne s'en sert jamais, mais vous en aurez besoin pour un accès
direct un jour.

## 2. Jouer le SQL, dans cet ordre

SQL Editor du dashboard, deux exécutions séparées :

1. tout le contenu de `supabase/schema.sql`
2. tout le contenu de `supabase/seed.sql`

Vérifier ensuite que la table `sessions` contient bien douze lignes et que
`rubric_groups` en contient six.

## 2 bis. Les migrations, dans l'ordre

Sur un projet déjà créé avant le 10 septembre 2026, exécutez dans cet ordre :
`002_gamification.sql`, `003_sessions.sql`, `004_security.sql`, `005_results.sql`. Sur un projet neuf,
`bootstrap.sql` contient déjà tout sauf `003_sessions.sql`, à passer ensuite.

`004_security.sql` change deux choses visibles : personne ne peut plus se donner
un rôle, et **chaque invitation porte un code à six caractères**, affiché dans
l'admin à côté de l'adresse. L'étudiant le tape à la création de son mot de
passe. Envoyez-lui le lien du site et son code ensemble.

## 2 ter. La gamification

Une fois le bootstrap passé, exécutez aussi `supabase/002_gamification.sql`.
Il ajoute le consentement RGPD et la date d'onboarding sur les profils, et la
fonction `leaderboard()` qui alimente le classement de saison. Sans lui, la page
Board affiche un message explicite et l'onboarding est sauté.

## 3. Vous inviter, vous deux

Après `004_security.sql`, relisez vos deux lignes : `select email, code from invitations;`
vous donne le code à taper si l'un de vous n'a pas encore créé son compte.

Personne ne peut créer de compte sans être dans `invitations`, vous compris.
Le trigger refuse toute autre adresse.

```sql
insert into invitations (email, full_name) values
  ('ton-email@example.com',    'Prénom Nom'),
  ('email-associe@example.com','Prénom Nom');
```

## 4. Le piège qui casserait la séance 1

Le service email intégré de Supabase est limité à **2 messages par heure**.
Six étudiants qui se connectent en même temps, c'est quatre étudiants
bloqués et une séance perdue.

**Pour le lancement, n'envoyez aucun email.** Authentication puis Sign In and
Providers : activez Email, activez le mot de passe, et **désactivez la
confirmation d'email**. Zéro email envoyé, zéro limite de débit. Vous créez
les comptes des étudiants en séance 0, ils changent leur mot de passe eux-mêmes.

Le lien magique reste la bonne cible, mais il exige un SMTP à vous, Resend ou
Brevo, avec un domaine vérifié. Vous n'avez pas encore de domaine pour l'asso.
Une fois le SMTP branché, la limite passe à 30 messages par heure, largement
suffisant, et ça devient une démonstration parfaite pour la séance 9.

## 4 bis. Mot de passe oublié

Le site propose « Forgot my password », qui passe par le mailer intégré, plafonné
à deux envois par heure. En séance, plus simple : Authentication → Users → l'étudiant
→ Send password recovery, ou réinitialisez-le vous-même depuis ce même écran.

## 5. Se connecter une fois chacun

Depuis le site en local, `npm run dev`, créez vos deux comptes. Le trigger
vous crée un profil avec le rôle `student`.

## 6. Vous passer en admin

Sans ça, aucune des politiques d'administration ne s'ouvre, et vous ne voyez
même pas les séances verrouillées.

```sql
update profiles set role = 'admin'
where id in (
  select id from auth.users
  where email in ('ton-email@example.com', 'email-associe@example.com')
);
```

Vérification : `select full_name, role from profiles;` doit afficher deux
lignes en `admin`.

## 7. Récupérer les deux valeurs

Settings puis API Keys. Vous prenez :

- l'**URL du projet**
- la **publishable key**, celle qui commence par `sb_publishable_`

Jamais la secret key, jamais une `service_role`. Elles contournent la RLS et
n'ont rien à faire dans un navigateur ni dans un repo public.

En local :

```bash
cp .env.example .env.local
# puis coller les deux valeurs
```

## 8. Après le premier déploiement Cloudflare seulement

Vous ne connaissez l'URL `.pages.dev` qu'après le premier build. Retournez
alors dans Authentication puis URL Configuration et renseignez :

- **Site URL** : `https://<projet>.pages.dev`
- **Redirect URLs** : `https://<projet>.pages.dev/**` et
  `http://localhost:3000/**`

Sans ça, toute redirection d'authentification renvoie sur localhost et
l'étudiant tombe sur une page morte. C'est l'erreur la plus fréquente.

---

## Côté Cloudflare Pages

| Réglage | Valeur |
|---|---|
| Build command | `npm run build` |
| Output directory | `out` |
| `NODE_VERSION` | `20` ou plus |
| `NEXT_PUBLIC_SUPABASE_URL` | l'URL du projet |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la publishable key |

Les deux variables se déclarent en **Production et en Preview**. Une variable
ajoutée après un build n'est pas prise en compte : relancez un déploiement
depuis Deployments puis Retry deployment.

## Le jour d'un concours

Dans `/admin/`, section Contests : en brouillon vous écrivez le brief et trois
contraintes, « Open » lance les rendus, « Close submissions » à 23h59 ouvre la
notation. Chacun de vous note ensuite en aveugle sur `/judge/`. Puis « Compute the
ranking », une phrase par projet, « Publish » : le concours se ferme et les
résultats apparaissent sur `/results/` avec les noms selon le consentement.

## Inviter les étudiants, ensuite

Une ligne par étudiant dans `invitations`, puis vous envoyez le lien du site.
Faites-le avant la séance, pas pendant.

```sql
insert into invitations (email, full_name) values
  ('etudiant@example.com', 'Prénom Nom');
```
