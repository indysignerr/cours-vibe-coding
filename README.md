# Albert L.I.G.H.T. — albertlight.com

Le site vitrine d'Albert L.I.G.H.T. (*Lab of Intelligent, Generative,
Hands-on Technology*), l'association étudiante d'Albert School Milano.
Trois langues — anglais d'abord, puis italien et français —, une ampoule
en 3D dont le filament écrit un L, et tout le contenu dans des fichiers de
données.

**En ligne :** <https://albertlight.com>. Chaque `git push` sur `main`
redéploie le site sur Cloudflare Pages, en une minute environ.

> **In English, in 30 seconds.** Everything you can read on the site lives
> in `content/`. Edit a JSON file — on your machine or straight from
> GitHub's web editor — commit to `main`, and the site rebuilds itself in
> about a minute. Calendar: `content/events.json`. Team:
> `content/team.json`. Partners: `content/partners.json`. Every sentence, in
> three languages: `content/i18n/`. The rest of this page is in French; the
> field names are the same whatever language you read.

## Démarrer

```bash
npm install
cp .env.example .env.local   # les deux valeurs Supabase, publiques par nature
npm run dev                  # http://localhost:3000
```

Node 20.9 ou plus récent.

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev` | le site en local |
| `npm run build` | l'export statique dans `out/` — refait d'abord le fichier `.ics` |
| `npm run audit` | relit `out/` : titres, descriptions, liens morts, `h1`, JSON-LD, images sans `alt` |
| `npm run contrast` | vérifie chaque paire de couleurs en WCAG AA |
| `npm run lint` | ESLint |
| `npm run events:sql` | réécrit `supabase/008_programme.sql` à partir du calendrier |

## Modifier le contenu

Rien de ce qui se lit sur le site n'est écrit dans le code.

| Pour changer… | Fichier |
|---|---|
| une date, un lieu, un événement | `content/events.json` |
| le bureau | `content/team.json` |
| les partenaires et leurs logos | `content/partners.json` |
| les quatre piliers et leurs formats | `content/pillars.json` |
| une phrase du site, dans une des trois langues | `content/i18n/en.json`, `it.json`, `fr.json` |
| le nom, le slogan, l'email, LinkedIn, les fondateurs | `content/site.json` |

Trois règles valent pour tous ces fichiers :

- **Trois langues, toujours.** Un texte s'écrit `{ "en": "…", "it": "…", "fr": "…" }`.
- **`null` veut dire « pas encore connu ».** Le site l'affiche comme tel
  (« Lieu à confirmer »). On ne remplit pas un vide avec une supposition.
- **JSON strict.** Guillemets doubles, pas de virgule après le dernier
  élément. Une faute fait échouer le build : l'ancienne version reste en
  ligne, rien ne casse. L'échec se lit dans Cloudflare Pages → Deployments.

### Le calendrier — `content/events.json`

Un bloc par date, dans `events`. Les événements passés se rangent et se
grisent tout seuls, d'après la date.

```json
{
  "slug": "tournament-1",
  "pillar": "compete",
  "format": "tournament",
  "date": "2026-11-21",
  "start": "14:00",
  "end": "18:00",
  "audience": "members",
  "online": false,
  "location": null,
  "capacity": null,
  "partner": null,
  "backup": null,
  "title": { "en": "…", "it": "…", "fr": "…" },
  "summary": { "en": "…", "it": "…", "fr": "…" },
  "gallery": []
}
```

| Champ | Valeurs | À savoir |
|---|---|---|
| `slug` | minuscules et tirets | L'adresse de la page (`/events/<slug>/`) et la clé des inscriptions. **Ne jamais le changer une fois publié.** |
| `pillar` | `learn` · `build` · `compete` · `connect` | Le pilier, rappelé dans le badge de l'événement. |
| `format` | `workshop` · `crash-course` · `build-lab` · `tournament` · `open-event` | Sert au filtre de la page Programme. |
| `date` | `AAAA-MM-JJ` | |
| `endDate` | `AAAA-MM-JJ`, facultatif | Pour une fenêtre (« dans la semaine du… ») ou plusieurs jours. |
| `start`, `end` | `HH:MM`, facultatifs | Heure de Milan. Sans horaire : journée entière. |
| `audience` | `open` · `members` | Le badge et le filtre Open / Members. |
| `online` | `true` · `false` | |
| `location` | `{ en, it, fr }` ou `null` | `null` affiche « Lieu à confirmer ». |
| `capacity` | un nombre ou `null` | La jauge. `null` : pas de limite. |
| `partner` | texte ou `null` | |
| `backup` | `AAAA-MM-JJ` ou `null` | La date de repli. |
| `gallery` | liste de chemins d'images | Voir plus bas. |

**Confirmer un lieu.** Remplacer `"location": null` par
`"location": { "en": "Room 2.1, Albert School", "it": "…", "fr": "…" }`.

**Ajouter un événement.** Copier un bloc, lui donner un `slug` neuf, puis
lancer `npm run events:sql` et jouer le fichier produit dans Supabase
(voir [Les inscriptions](#les-inscriptions)). Sans cette seconde étape la
page existe, mais elle affiche « Sign-ups are not open yet » à la place du
formulaire.

**Build Lab.** Les dates régulières sont dans `buildLab` : `first` pour la
première séance, `dates` pour les suivantes.

**Après l'événement, la galerie.** Déposer les photos dans
`public/events/<slug>/` (JPEG ou WebP, 1600 px de large, moins de 300 Ko
chacune : elles sont servies telles quelles), puis lister leurs chemins :
`"gallery": ["/events/tournament-1/01.webp", "/events/tournament-1/02.webp"]`.
Le bloc Photos n'apparaît que lorsque la liste n'est pas vide.

Le fichier d'agenda `public/albert-light.ics` (Apple Calendar, Outlook) est
refait tout seul à chaque build.

### L'équipe — `content/team.json`

Une entrée par personne dans `board`, dans l'ordre d'affichage.

```json
{
  "name": "Jiali",
  "role": { "en": "Communication & media", "it": "…", "fr": "…" },
  "focus": { "en": "Instagram and LinkedIn", "it": "…", "fr": "…" }
}
```

`focus` peut valoir `null`. Le nombre de membres affiché dans le titre suit
la liste. Les fondateurs, eux, sont dans `content/site.json` → `founders`.

### Les partenaires — `content/partners.json`

Une entrée par partenaire dans `partners`, dans l'ordre d'affichage.

```json
{
  "id": "codemotion",
  "name": { "en": "Codemotion", "it": "Codemotion", "fr": "Codemotion" },
  "ask": { "en": "…", "it": "…", "fr": "…" },
  "logo": null,
  "url": null
}
```

- **`logo`.** Tant qu'il vaut `null`, le nom s'affiche en typographie. Pour
  mettre un logo : déposer le fichier dans `public/partners/` et écrire son
  chemin, `"/partners/codemotion.svg"`. Le bloc est sur fond marine :
  fournir la **version claire** du logo (blanche ou ivoire), en SVG de
  préférence. Il s'affiche dans un cadre de 176 × 42 px au plus.
- **`url`.** Renseignée, elle rend le nom ou le logo cliquable.
- **`ask`.** Ce que le plan annuel prévoit de leur demander. On ne prête
  pas à un partenaire un rôle qu'il n'a pas accepté.

### Les textes — `content/i18n/`

Trois fichiers aux clés identiques. À retenir :

- `egg.message` — le message de l'easter egg. C'est encore un texte
  provisoire : le bureau doit écrire le sien, dans les trois langues.
- Les mots entre accolades (`{n}`, `{names}`, `{title}`) sont remplacés par
  le site. Les garder tels quels.
- Les pages `/setup/`, `/legal/` et `/privacy/` n'existent qu'en anglais ;
  leur texte est dans `src/app/(en)/`.

### L'identité — `content/site.json`

- `email.active` — `false` aujourd'hui : l'adresse s'affiche avec la
  mention « not live yet », sans lien. Passer à `true` une fois le routage
  Cloudflare Email en place.
- `social.linkedin`, `founders`, `tagline`, `googleSiteVerification`.

## Les inscriptions

Le formulaire d'un événement écrit dans Supabase, par la fonction `rsvp`.
Les listes ne sont lisibles que par les organisateurs, sur `/admin/`. La
case « I want to join Albert L.I.G.H.T. » y devient la colonne *Joining*,
à l'écran comme dans l'export CSV.

La page d'un événement vérifie à l'arrivée que le formulaire peut aboutir.
Si la base ne répond pas, ou si elle ne connaît pas l'événement, elle
affiche « Sign-ups are not open yet » et le lien d'agenda, au lieu d'un
formulaire qui échouerait.

> **État au 9 novembre 2026 : la base ne répond pas.** L'adresse du projet
> Supabase configurée pour le site n'existe plus dans le DNS. C'est le
> signe d'un projet mis en pause (l'offre gratuite s'endort après une
> semaine sans activité) ou supprimé. Tant que ce n'est pas rétabli,
> aucune inscription ne passe.

**Si le projet est en pause** — le cas le plus probable :

1. [supabase.com/dashboard](https://supabase.com/dashboard) → le projet → **Restore project**.
2. SQL Editor → coller `supabase/008_programme.sql` → Run. Il charge les
   dix événements du calendrier et ferme les quatre anciens, sans rien
   supprimer.
3. Ouvrir une page d'événement : le formulaire est revenu. S'inscrire pour
   essayer, puis vérifier la ligne sur `/admin/`.

**Si le projet a été supprimé :**

1. Créer un projet Supabase, dans une région européenne.
2. SQL Editor → `supabase/setup.sql`, puis `supabase/008_programme.sql`.
3. Créer les comptes des organisateurs : la marche à suivre est à la fin
   de `setup.sql`.
4. Cloudflare Pages → Settings → Environment variables : mettre à jour
   `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   (la clé *publishable*, jamais une clé secrète), puis relancer un
   déploiement. Faire de même dans `.env.local`.

**À chaque changement de calendrier :** `npm run events:sql`, puis rejouer
`supabase/008_programme.sql`. Le fichier est sans danger et rejouable.

`setup.sql` et `008_programme.sql` ont été joués sur un PostgreSQL de
test : un visiteur peut s'inscrire et lire les compteurs, mais ne lit
aucune inscription ; seul un organisateur voit et gère les listes.
`bootstrap.sql`, `schema.sql`, `seed.sql` et les fichiers `002` à `007`
datent de l'ancien parcours de cours ; `bootstrap.sql` échoue sur une base
neuve. Ne pas s'en servir pour repartir de zéro.

## Comment c'est construit

**La pile.** Next.js 16 en export statique, Three.js, GSAP, Lenis,
Cloudflare Pages. Le brief proposait Astro ; Next.js est resté parce que
le dépôt, ses règles d'export statique, son déploiement Cloudflare et son
formulaire Supabase existaient déjà en Next.js, et que la sortie est la
même : des fichiers HTML statiques, lisibles sans JavaScript.

```
content/                 tout le contenu (JSON)
src/app/(en)/ fr/ it/    les routes, une racine par langue
src/components/hero/     l'ampoule : la scène 3D et son image fixe
src/components/home/     les blocs de l'accueil
src/components/pages/    une page = un composant, pour les trois langues
src/components/motion/   le défilement, le curseur, le son
src/lib/                 lecture des données, i18n, dates
src/app/globals.css      les couleurs, la typographie, toutes les animations
scripts/                 audit, contraste, .ics, SQL, favicons, images de partage
supabase/                la base des inscriptions
public/_redirects        les anciennes adresses, et les alias /programme, /equipe…
```

**Les adresses.** L'anglais est à la racine (`/events/`, `/team/`,
`/join/`), l'italien sous `/it/`, le français sous `/fr/`
(`/fr/programme/`, `/fr/evenements/<slug>/`, `/fr/equipe/`,
`/fr/rejoindre/`). Les adresses françaises sans préfixe (`/programme`,
`/equipe`, `/rejoindre`, `/evenements/…`) redirigent vers la version
française.

**Trois règles tiennent les animations**, et elles sont écrites en tête de
`globals.css` :

1. *Le contenu d'abord.* L'état de base de chaque élément est son état
   visible et final. Tout ce qui cache ou décale pour animer vit sous
   `html.motion`, une classe posée par un script avant la première
   peinture, et seulement si le système ne demande pas moins de mouvement.
   Sans JavaScript ou en mouvement réduit : rien n'est caché, rien ne bouge.
2. *Le grand spectacle est pour le grand écran.* La scène 3D, le curseur
   et le défilement lissé vivent sous `html.fine` (souris, 1024 px et
   plus). Au téléphone : une image de l'ampoule, le défilement natif.
3. *Le texte avant la 3D.* Three.js n'est importé qu'une fois le haut de
   page affiché, et jamais sur téléphone.

**Refaire l'image de l'ampoule.** Elle est une capture de la vraie scène.
Si la scène change d'aspect, la marche à suivre est en tête de
`scripts/make-poster.mjs`.

**Les images de partage** (`public/og.png`, `public/og/`) et les favicons
se refont avec `node scripts/generate-og.mjs` et
`node scripts/generate-favicon.mjs`.

## Vérifications

Mesures du 9 novembre 2026.

| Contrôle | Résultat |
|---|---|
| `tsc`, ESLint, build | aucun avertissement, 50 pages |
| `npm run audit` | 49 pages, zéro défaut |
| `npm run contrast` | toutes les paires passent en AA |
| Sans JavaScript | tout le texte est visible, sur chaque type de page |
| Mouvement réduit | pas de 3D, pas de transition, pas de curseur, rien de caché |
| Mobile 375 px | pas de 3D, pas de défilement horizontal, image de l'ampoule, 382 cibles tactiles à 44 px ou plus |
| Clavier | lien d'évitement, ordre logique, anneau de focus partout |
| Défilement du haut de page, grand écran | 60 images par seconde, aucune image au-delà de 33 ms |

Lighthouse, mobile, sur le site en ligne :

| Page | Performance | Accessibilité | SEO | Bonnes pratiques |
|---|---|---|---|---|
| `/` | 96 | 100 | 100 | 100 |
| `/events/` | 98 | 100 | 100 | 100 |
| `/events/tournament-1/` | 97 | 100 | 100 | 96 |
| `/fr/rejoindre/` | 98 | 100 | 100 | 100 |

Le 96 de la page d'un événement vient de la base qui ne répond pas : la
requête en échec s'inscrit dans la console. Il repasse à 100 une fois
Supabase rétabli.

Le plus grand élément s'affiche en 2,3 à 2,7 s selon le modèle simulé de
Lighthouse, et en 1,6 à 1,8 s avec un bridage réel (4G lente, processeur
ralenti quatre fois), mesuré en local.

## Déploiement

Cloudflare Pages, relié à ce dépôt. Build command `npm run build`, output
directory `out`, `NODE_VERSION` à 20 ou plus, et les deux variables
`NEXT_PUBLIC_SUPABASE_*`. Les en-têtes de sécurité et de cache sont dans
`public/_headers`, les redirections dans `public/_redirects`.

## Ce qui manque encore

Ce que le site ne peut pas inventer, et où le renseigner.

| Manque | Où |
|---|---|
| Les lieux de neuf événements sur dix | `content/events.json` → `location` |
| L'adresse `hello@albertlight.com`, pas encore routée | Cloudflare Email Routing, puis `content/site.json` → `email.active` |
| Le message de l'easter egg | `content/i18n/*.json` → `egg.message` |
| Les logos des partenaires | `public/partners/`, puis `content/partners.json` → `logo` |
| La base des inscriptions | voir [Les inscriptions](#les-inscriptions) |
| La redirection de `www.albertlight.com` vers `albertlight.com` | une règle dans Cloudflare : `SEO-CHECKLIST.md`, point 0 |
| `/setup/`, `/legal/`, `/privacy/` en italien et en français | `src/app/(en)/` |
| La relecture des mentions légales par le bureau | `/legal/` annonce le droit français ; `/privacy/` décrit la liste des membres |

## Autres documents

- `SEO-CHECKLIST.md` — Search Console et liens entrants : ce qui demande vos comptes.
- `SETUP-SUPABASE.md`, `ARCHITECTURE.md` — archives de l'ancien parcours
  de cours. Pour le site actuel, cette page fait foi.
- `RUBRIC.md`, `seances/`, `junior/` — le contenu des cours et de la
  structure junior, sans lien avec le site.
