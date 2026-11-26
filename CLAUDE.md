@AGENTS.md

# Règles de ce projet

- **Export statique obligatoire.** `output: "export"`. Pas de route handler,
  pas de server action, pas de middleware. Toute lecture de données passe par
  le navigateur sous l'identité de l'étudiant.
- **Le verrou des séances est la RLS**, jamais le code du site. Ne jamais
  contourner une politique avec une clé de service côté client.
- **Le site est aussi le support projeté.** Corps de texte jamais sous 17 px,
  code jamais sous 20 px en séance, rien d'important dans le bas de l'écran.
- **Contenu en anglais**, commentaires de code en français.
- **Identité.** L'asso s'appelle Albert LIGHT, sans points. Le nom vit dans
  `content/site.json`, le logo dans `src/lib/brand-shapes.json`, la palette
  et la typo dans `src/app/globals.css` et `src/lib/fonts.ts`. Quatre
  fichiers, pas un de plus.
- **Interdits** : la palette Indysigner, les couleurs d'Albert School, Inter,
  Roboto, Arial, une grille 12 colonnes symétrique, un aplat de fond uni.
- **Rien qui fasse site généré.** Pas de dégradé, d'ombre portée, de verre
  flou, de coin arrondi, d'icône toute faite, d'emoji, de tiret long dans
  les textes, ni de survol qui gigote. La liste entière est dans le README,
  « Ce que le site s'interdit » : la relire avant d'ajouter un bloc.
- Cloudflare Pages uniquement. Jamais Vercel.
