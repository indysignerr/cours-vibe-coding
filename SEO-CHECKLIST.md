# SEO — ce qui est fait, et ce qui demande vos comptes

Dernière mise à jour : 9 novembre 2026.

---

## Fait, et déployé

| | état |
|---|---|
| Domaine `albertlight.com` | en ligne, HTTPS, apex et www |
| `www` → apex en 301 | ajouté dans `public/_redirects` |
| Sitemap | 45 URL — les trois langues, avec `lastmod` et leurs `hreflang` |
| `robots.txt` | ouvert, `/admin/` exclu |
| Une page par évènement | 10 pages statiques, dans chacune des trois langues |
| `schema.org/Event` | sur les 10, avec `name`, `startDate`, `location` |
| `BreadcrumbList` | sur chaque page évènement |
| `ItemList` | sur `/events/`, `/it/programma/` et `/fr/programme/` |
| `Organization` | avec `sameAs` (LinkedIn), `alternateName`, `foundingDate` |
| Titres et descriptions | uniques sur chaque page |
| `canonical` et `hreflang` | sur chaque page : Google sait que `/events/`, `/it/programma/` et `/fr/programme/` sont la même page en trois langues |
| Audit statique | `npm run audit` — 49 pages, zéro défaut |

---

## 1. Search Console — 10 minutes, il faut votre compte Google

Je ne peux pas le faire : la propriété doit être créée depuis le compte
Google de l'association (idéalement `hello@albertlight.com`, pas un compte
personnel — sinon la propriété part avec la personne).

**Méthode recommandée : propriété « Domaine », vérifiée par DNS.**
Elle couvre l'apex, le `www` et tous les sous-domaines d'un coup, et elle
survit à une refonte du site.

1. [search.google.com/search-console](https://search.google.com/search-console) → **Ajouter une propriété** → **Domaine** → `albertlight.com`
2. Google affiche un enregistrement `TXT` du type `google-site-verification=…`
3. Dans Cloudflare → `albertlight.com` → **DNS** → **Add record**
   - Type `TXT`, Name `@`, Content : la ligne donnée par Google
4. Revenir sur Search Console → **Vérifier** (compter quelques minutes)
5. **Sitemaps** → ajouter `sitemap.xml` → Envoyer
6. **Inspection d'URL** → coller `https://albertlight.com/events/tournament-1/` → **Demander l'indexation**

> Si la méthode DNS bloque, le site accepte aussi la balise HTML : coller le
> code dans `googleSiteVerification` (`content/site.json`) et pousser. La
> propriété « Domaine » reste préférable.

**À vérifier ensuite, dans Search Console :**
- *Expérience* → *Résultats enrichis* : les 10 évènements doivent apparaître sous **Événements**
- Tester une page sur [search.google.com/test/rich-results](https://search.google.com/test/rich-results)

---

## 2. Les liens entrants — le facteur le plus lourd

Tout le reste est du réglage. Un lien depuis le domaine de l'école pèse
plus que l'ensemble du travail technique ci-dessus.

### a. Albert School — prioritaire

Le plan annuel le prévoit déjà (« event listings on the school website »).
Message prêt à envoyer :

> Objet : Albert LIGHT — lien vers notre site et annonce des évènements
>
> Bonjour,
>
> Albert LIGHT, l'association étudiante IA et code de l'école, a mis son
> site en ligne : https://albertlight.com — il porte le calendrier complet
> de novembre à mai, avec les inscriptions.
>
> Deux demandes :
> 1. Un lien vers le site depuis la page des associations étudiantes.
> 2. L'annonce de nos évènements ouverts sur le site de l'école, en
>    particulier l'atelier Codemotion du 5 décembre, ouvert à tous.
>
> Chaque évènement a sa propre page, par exemple
> https://albertlight.com/events/codemotion-llms-python/
>
> Merci,

**Important :** demander un lien normal. Un lien en `nofollow` ne transmet
rien.

### b. Codemotion — pour l'atelier du 5 décembre

Ils co-organisent. Demander que leur annonce pointe vers
`https://albertlight.com/events/codemotion-llms-python/` plutôt que vers
une page générique. Leur domaine a une forte autorité.

### c. LinkedIn — déjà en place

La page porte déjà `albertlight.com`. Deux ajouts utiles :
- Mettre le lien de la page de l'évènement dans chaque publication, pas
  seulement le lien du site
- Ajouter **Milan** dans la localisation de la page : les recherches
  locales en dépendent

### d. Les autres, dans l'ordre du plan

Floriano's team (soirée cinéma), n8n ou Lovable, Albert Junior Consulting
Enterprise. À chaque fois : demander que le lien pointe vers la page de
l'évènement concerné.

---

## 3. Encore ouvert

- **`hello@albertlight.com` ne fonctionne pas** tant que Cloudflare Email
  Routing n'est pas configuré. Le site l'affiche donc sans lien, avec la
  mention « not live yet » ; une fois le routage en place, passer
  `email.active` à `true` dans `content/site.json`. (Le plan le prévoyait
  pour le 8 novembre.)
- **Les inscriptions ne passent pas** : la base Supabase ne répond plus.
  Voir « Les inscriptions » dans le README.
- **Les AI discovery days** avec Albert School n'ont pas de date au plan
  (« TBC, from January ») : absentes du site, donc invisibles de Google.
- **Des photos réelles.** Le site n'a plus aucune photo. Après le tournoi
  du 21 novembre, en ajouter à la galerie de l'évènement (`gallery` dans
  `content/events.json`) — pour les gens comme pour Google Images.
