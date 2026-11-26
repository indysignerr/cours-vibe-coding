# Albert LIGHT : albertlight.com

Le site d'Albert LIGHT (*Lab of Intelligent, Generative, Hands-on
Technology*), l'association étudiante d'IA et de développement logiciel
d'Albert School Milano. Quatre langues (anglais d'abord, puis italien,
français et espagnol), une maquette du labo en 3D qui tourne pendant qu'on
lit les quatre piliers, et tout le contenu dans des fichiers de données.

**En ligne :** <https://albertlight.com>. Chaque `git push` sur `main`
redéploie le site sur Cloudflare Pages, en une minute environ.

> **In English, in 30 seconds.** Everything you can read on the site lives
> in `content/`. Edit a JSON file, on your machine or straight from
> GitHub's web editor, commit to `main`, and the site rebuilds itself in
> about a minute. Calendar: `content/events.json`. Team:
> `content/team.json`. Questions and answers: `content/faq.json`. Every
> other sentence, in four languages: `content/i18n/`. The rest of this page
> is in French; the field names are the same whatever language you read.

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
| `npm run build` | l'export statique dans `out/` : vérifie d'abord le contenu, puis refait le fichier `.ics` |
| `npm run content` | vérifie que chaque texte de `content/` existe dans les quatre langues |
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
| les quatre piliers et leurs formats | `content/pillars.json` |
| une question fréquente et sa réponse | `content/faq.json` |
| une phrase du site, dans une des quatre langues | `content/i18n/en.json`, `it.json`, `fr.json`, `es.json` |
| le nom, le slogan, l'email, LinkedIn, les fondateurs | `content/site.json` |

Trois règles valent pour tous ces fichiers :

- **Quatre langues, toujours.** Un texte s'écrit `{ "en": "…", "it": "…", "fr": "…", "es": "…" }`.
  S'il en manque une, le build s'arrête et nomme le fichier et le champ
  (`content/events.json → events[2].location : il manque "es"`). Pour
  vérifier sans tout construire : `npm run content`.
- **`null` veut dire « pas encore connu ».** Le site l'affiche comme tel
  (« Lieu à confirmer »). On ne remplit pas un vide avec une supposition.
- **JSON strict.** Guillemets doubles, pas de virgule après le dernier
  élément. Une faute fait échouer le build : l'ancienne version reste en
  ligne, rien ne casse. L'échec se lit dans Cloudflare Pages → Deployments.

### Le calendrier : `content/events.json`

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
  "title": { "en": "…", "it": "…", "fr": "…", "es": "…" },
  "summary": { "en": "…", "it": "…", "fr": "…", "es": "…" },
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
| `location` | `{ en, it, fr, es }` ou `null` | `null` affiche « Lieu à confirmer ». |
| `capacity` | un nombre ou `null` | La jauge. `null` : pas de limite. |
| `partner` | texte ou `null` | |
| `backup` | `AAAA-MM-JJ` ou `null` | La date de repli. |
| `gallery` | liste de chemins d'images | Voir plus bas. |

**Confirmer un lieu.** Remplacer `"location": null` par
`"location": { "en": "Room 2.1, Albert School", "it": "…", "fr": "…", "es": "…" }`.

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

### L'équipe : `content/team.json`

Une entrée par personne dans `board`, dans l'ordre d'affichage.

```json
{
  "name": "Jiali",
  "role": { "en": "Communication & media", "it": "…", "fr": "…", "es": "…" },
  "focus": null
}
```

`role` est ce qui s'affiche à côté du nom. `focus` est la précision écrite
dessous : `null` pour ne rien afficher, ou un texte par langue comme pour
le rôle. Le nombre de membres affiché dans le titre suit la liste. Les
fondateurs, eux, sont dans `content/site.json` → `founders`.

### Les piliers : `content/pillars.json`

Quatre entrées, dans l'ordre. `key` ne change pas : il relie le pilier à
ses événements et à sa pièce dans la maquette 3D. `title` reste en anglais
dans les quatre langues. `line` est la phrase du texte officiel de
l'association, `promise` la promesse du plan, `formats` la liste des
formats (`name`, `what`, `length`).

### Les questions fréquentes : `content/faq.json`

Des groupes (`groups`), et dans chacun des questions (`items`).

```json
{
  "id": "cost",
  "home": true,
  "q": { "en": "How much does it cost?", "it": "…", "fr": "…", "es": "…" },
  "a": { "en": "Nothing. Every event is free, and so is joining.", "it": "…", "fr": "…", "es": "…" }
}
```

- **`id`** sert d'ancre (`/faq/#cost`) : ne pas le changer une fois publié.
- **`home`** : `true` pour reprendre la question sur l'accueil. Cinq au plus.
- **Une réponse ne dit que ce qui est décidé.** Le plan annuel ou le texte
  officiel de l'association : rien d'autre. Une question sans réponse
  certaine ne s'ajoute pas.

La page `/faq/` donne aussi ces questions aux moteurs de recherche
(schéma `FAQPage`) : elles peuvent s'afficher directement dans Google.

### Les textes : `content/i18n/`

Quatre fichiers aux clés identiques. À retenir :

- `mission` est le texte officiel de l'association, tel qu'elle l'a écrit.
  Le modifier, c'est modifier ce texte dans les quatre langues.
- Les mots entre accolades (`{n}`, `{names}`, `{title}`) sont remplacés par
  le site. Les garder tels quels.
- Les pages `/setup/`, `/legal/` et `/privacy/` n'existent qu'en anglais ;
  leur texte est dans `src/app/(en)/`.

### L'identité : `content/site.json`

- `email.active` : `false` aujourd'hui, et l'adresse n'apparaît alors pas
  dans le pied de page. Passer à `true` une fois le routage Cloudflare
  Email vérifié : elle s'affiche, en lien cliquable.
- `social.linkedin`, `founders`, `tagline`, `googleSiteVerification`.

## Les inscriptions

Le formulaire d'un événement écrit dans Supabase, par la fonction `rsvp`.
Les listes ne sont lisibles que par les organisateurs, sur `/admin/`. La
case « I want to join Albert LIGHT » y devient la colonne *Joining*,
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

**Si le projet est en pause**, le cas le plus probable :

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

**La pile.** Next.js 16 en export statique, React-Three-Fiber pour la
maquette 3D, Lenis pour le défilement, Cloudflare Pages. La sortie est
faite de fichiers HTML statiques, lisibles sans JavaScript.

```
content/                 tout le contenu (JSON)
src/app/(en)/ fr/ it/ es/  les routes, une racine par langue
src/components/home/     les sections de l'accueil
src/components/lab/      la maquette 3D : ses pièces, sa scène, son cadre
src/components/pages/    une page = un composant, pour les quatre langues
src/components/motion/   les apparitions au défilement, le défilement lissé
src/lib/                 lecture des données, i18n, dates
src/fonts/               les deux coupes de Newsreader, en fichiers locaux
src/app/globals.css      les couleurs, la typographie, la grille, le mouvement
scripts/                 audit, contraste, .ics, SQL, favicons, images
supabase/                la base des inscriptions
public/_redirects        les anciennes adresses, et les alias /programme, /equipe…
```

**Les langues et les adresses.** L'anglais est la langue d'arrivée : il
est à la racine (`/`, `/events/`, `/team/`, `/join/`), et c'est lui qui
s'ouvre sur `albertlight.com` quelle que soit la langue du navigateur. Il
n'y a aucune détection ni redirection automatique. Les trois autres
langues ne s'ouvrent que si on les choisit dans le sélecteur :

| Langue | Accueil | À propos | Événements | Un événement | Équipe | Rejoindre | FAQ |
|---|---|---|---|---|---|---|---|
| Anglais | `/` | `/about/` | `/events/` | `/events/<slug>/` | `/team/` | `/join/` | `/faq/` |
| Italien | `/it/` | `/it/chi-siamo/` | `/it/programma/` | `/it/eventi/<slug>/` | `/it/team/` | `/it/unisciti/` | `/it/faq/` |
| Français | `/fr/` | `/fr/a-propos/` | `/fr/programme/` | `/fr/evenements/<slug>/` | `/fr/equipe/` | `/fr/rejoindre/` | `/fr/faq/` |
| Espagnol | `/es/` | `/es/sobre-nosotros/` | `/es/programa/` | `/es/eventos/<slug>/` | `/es/equipo/` | `/es/unete/` | `/es/faq/` |

Un nom de page propre à une langue, tapé sans préfixe (`/equipe`,
`/unisciti`, `/equipo`…), mène à cette langue. `/programme`, qui se dit
pareil en anglais et en français, mène à la page anglaise.

**Ajouter une langue.** L'ajouter à `LOCALES` et aux tables de
`src/lib/i18n.ts`, copier un dictionnaire dans `content/i18n/`, ajouter la
langue à chaque texte des fichiers de `content/`, copier le dossier
`src/app/es/` sous le nouveau code, et ajouter ses alias à
`public/_redirects`. `npm run content` liste alors chaque texte auquel
la nouvelle langue manque, et le build refuse de partir tant qu'il en reste.

**La mise en page.** Le site se lit comme un rapport : papier ivoire, encre
marine, beige en accent ; Newsreader pour les titres et les chiffres,
Albert Sans pour le texte. Cinq règles tiennent le reste, et elles sont
écrites en tête de `globals.css` :

1. *Le contenu d'abord.* L'état de base de chaque élément est son état
   visible et final. Tout ce qui cache ou décale pour animer vit sous
   `html.motion`, une classe posée par un script avant la première
   peinture, et seulement si le système ne demande pas moins de mouvement.
   Sans JavaScript ou en mouvement réduit : rien n'est caché, rien ne bouge.
2. *Le trait, pas l'effet.* Des filets et des angles droits. Pas de
   dégradé, pas d'ombre portée, pas de flou d'arrière-plan, pas de halo,
   pas de coin arrondi.
3. *Trois couleurs.* Marine, beige, ivoire et leurs nuances. Jamais de
   beige en texte sur l'ivoire : l'accent écrit y passe au bronze.
4. *Le survol informe, il ne joue pas.* Un lien ou un bouton change de
   couleur ; rien ne se soulève, rien ne glisse.
5. *Le compositeur seulement.* Ce qui bouge bouge en `transform` et en
   `opacity`.

**Ce que le site s'interdit.** La refonte de novembre 2026 a écarté, point
par point, ce qui fait reconnaître un site sorti d'un gabarit : dégradés
appuyés, jeu d'icônes tout fait, fond blanc pur, couleurs arc-en-ciel ou
pastel ou néon, ombres portées, trois cartes alignées, emojis, verre
dépoli, tirets longs dans les textes, Inter ou ses cousines, liseré coloré
à gauche des encarts, faux témoignages, grille « bento », fausse fenêtre
de terminal, tournure « ce n'est pas X, c'est Y », puces en coches, halos
flous, grilles de points, étincelles, flèches animées, survols qui
gigotent. Les mentions légales, les conditions d'utilisation et la page
de confidentialité existent, et ce qui charge montre un squelette plutôt
que « Loading… ». Avant d'ajouter un bloc, relire cette liste.

**D'une page à l'autre.** Une page neuve s'ouvre toujours en haut, d'un
coup ; un lien vers la page où l'on est déjà (le logo sur l'accueil)
ramène en haut en glissant ; le retour arrière rend à la page la hauteur
qu'elle avait. Les trois règles tiennent dans
`src/components/motion/motion-root.tsx`, avec l'attribut
`data-scroll-behavior` posé sur `<html>` : sans lui, Next 16 laisse le
lissage du CSS s'appliquer aux changements de page, et la page neuve
part de l'ancienne hauteur.

**Le haut de page.** Simple, à la demande du bureau : le titre de
l'affiche de l'association en grand (« Turn ideas into light. »), la
phrase de son texte officiel, deux boutons, et à droite le prochain
événement. Pas d'image : les quatre chiffres qui suivent ferment le
premier écran. Le dernier mot du titre prend sa couleur un instant après
les autres, c'est le seul effet. Deux essais ont été écartés le 26
novembre 2026 : une image de la maquette 3D, puis un plan technique de
l'ampoule, jugé trop technique. Ils sont dans l'historique git.

**La maquette 3D.** Les quatre piliers se lisent autour d'une maquette du
labo : un plateau tournant, quatre pièces, une par pilier, autour d'une
lampe qui reprend le logo. Pendant que les piliers défilent, le plateau
tourne et la pièce du pilier courant s'anime.

- Elle est construite en code : aucun modèle n'est téléchargé.
  `src/components/lab/kit.ts` définit trois formes (pavé, cylindre, boule)
  et fond des centaines de pièces en quelques objets ;
  `rooms.ts` décrit les quatre pièces et ce qui y bouge ;
  `lab-canvas.tsx` est la scène (React-Three-Fiber) ;
  `lab-stage.tsx` est son cadre dans la page.
- Elle n'est chargée que lorsque la section approche de l'écran, et sa
  boucle s'arrête dès qu'elle en sort. Si l'appareil peine, seule la
  résolution baisse.
- Sans JavaScript, en mouvement réduit, ou si WebGL manque : chaque pilier
  montre l'image fixe de sa pièce. La page dit la même chose.

**Refaire les images de la maquette.** Les images des quatre pièces sont
des captures de la vraie scène. Si la scène change
d'aspect, la marche à suivre est en tête de `scripts/make-lab-images.mjs`.

**Le logo.** C'est celui du bureau, relevé sur son fichier : l'ampoule au
trait, son « L », ses cinq rayons, et « ALBERT LIGHT » à côté. Sa
géométrie tient dans un seul fichier, `src/lib/brand-shapes.json`, lu à
la fois par le site (`src/components/brand.tsx`) et par les scripts. Le
nom y est dessiné en contours : aucune police n'est chargée pour
l'écrire. Les fichiers à donner à qui prépare un document sont dans
`public/brand/` : `logo.svg` et `mark.svg` pour un fond clair,
`logo-inverse.svg` et `mark-inverse.svg` pour un fond sombre.

**Les images de partage** (`public/og.png`, `public/og/`) et les favicons
se refont avec `node scripts/generate-og.mjs` et
`node scripts/generate-favicon.mjs`. À relancer si le logo ou le nom
change : les deux scripts lisent `brand-shapes.json` et
`content/site.json`.

## Vérifications

Mesures du 26 novembre 2026, après la refonte et le haut de page simplifié.

| Contrôle | Résultat |
|---|---|
| `tsc`, ESLint, build | aucun avertissement, 72 pages |
| `npm run content` | 4 langues, 190 textes par dictionnaire, 85 textes traduits dans les données, rien ne manque |
| `npm run audit` | 71 pages, zéro défaut |
| `npm run contrast` | toutes les paires passent en AA, sur ivoire comme sur marine |
| Débordement horizontal | aucun, sur 33 pages dans les quatre langues, à 320, 375, 768, 1024 et 1280 px ; l'accueil revu à douze largeurs, de 320 à 1920 px, après son nouveau haut de page |
| Sans JavaScript, ou en mouvement réduit | pas de 3D, rien de caché : chaque pilier montre l'image de sa pièce |
| D'une page à l'autre | la page neuve s'ouvre en haut, même cliquée pendant que l'ancienne défile encore ; le retour arrière rend la hauteur d'un coup. Contrôlé sur le site en ligne, avec et sans défilement lissé |
| Mobile 375 px | 390 liens et boutons contrôlés sur dix pages, tous à 44 px ou plus |
| Clavier | lien d'évitement, ordre logique, anneau de focus partout ; le menu et les questions sont des `<details>` |
| La maquette 3D | chargée seulement à l'approche de la section (251 Ko compressés), arrêtée hors écran |

Lighthouse, profil mobile, sur le site en ligne :

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | Plus grand élément |
|---|---|---|---|---|---|
| `/` | 98 à 100 | 100 | 100 | 100 | 1,1 à 2,1 s |
| `/faq/` | 97 | 100 | 100 | 100 | 2,7 s |
| `/it/chi-siamo/` | 96 | 100 | 100 | 100 | 2,8 s |

Aucun décalage de mise en page sur l'accueil (0), 0,02 sur la FAQ. Les
temps du plus grand élément sont ceux du modèle simulé de Lighthouse, qui
est pessimiste. La ligne de l'accueil date du haut de page simplifié :
son plus grand élément est le titre, du texte, et il n'y a plus d'image à
attendre. Deux passes : 98 puis 100. Les lignes de la FAQ et de la page
À propos sont celles d'avant.

Mesurées en local seulement, sur le site construit : `/fr/programme/` à 99,
et la page d'un événement à 94 avec 96 en bonnes pratiques. Ce 96 vient de
la base qui ne répond pas : la requête en échec s'inscrit dans la console.
Il repasse à 100 une fois Supabase rétabli.

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
| L'adresse `hello@albertlight.com` : à tester, puis à afficher | Cloudflare Email Routing, puis `content/site.json` → `email.active` |
| La relecture de l'italien et de l'espagnol par quelqu'un dont c'est la langue | `content/i18n/it.json`, `es.json`, `content/faq.json` |
| Des photos des événements passés | `content/events.json` → `gallery` |
| La base des inscriptions | voir [Les inscriptions](#les-inscriptions) |
| La redirection de `www.albertlight.com` vers `albertlight.com` | une règle dans Cloudflare : `SEO-CHECKLIST.md`, point 0 |
| `/setup/`, `/legal/`, `/privacy/` en italien, en français et en espagnol | `src/app/(en)/` |
| La relecture des mentions légales par le bureau | `/legal/` annonce le droit français ; `/privacy/` décrit la liste des membres |

## Autres documents

- `SEO-CHECKLIST.md` : Search Console et liens entrants, ce qui demande vos comptes.
- `SETUP-SUPABASE.md`, `ARCHITECTURE.md` : archives de l'ancien parcours
  de cours. Pour le site actuel, cette page fait foi.
- `RUBRIC.md`, `seances/`, `junior/` : le contenu des cours et de la
  structure junior, sans lien avec le site.
