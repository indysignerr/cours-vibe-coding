# S01 — Ship something live · conducteur

Victoire de fin d'heure : chaque étudiant a une page à son nom sur une URL publique, ouverte depuis son téléphone.
Notion unique : la boucle prompt → code → déploiement. Rien d'autre. Pas de git, pas de framework.

## Avant la séance
- Starter testé la veille : `public/starters/s01-ship-something-live.zip` s'ouvre et s'affiche.
- Compte Cloudflare de démo connecté, un projet Pages vide déjà créé pour gagner 2 minutes.
- Vérifier que la séance 1 est **ouverte** dans l'admin, sinon personne ne voit les prompts.
- Salle ouverte 10 min avant pour le dépannage setup. Un étudiant sans `claude` qui répond ne suit pas, il regarde : binôme immédiat.

## 00:00–00:03 · Accueil
Une phrase : « À 00:60, vous m'envoyez un lien que j'ouvre sur mon téléphone. C'est tout le cours. »

## 00:03–00:08 · L'échec
1. Ouvrir `index.html` du starter en double-cliquant. Ça s'affiche. « Génial, c'est en ligne ? »
2. Copier l'URL de la barre d'adresse : `file:///Users/…`. L'envoyer sur le WhatsApp du groupe. Demander à quelqu'un de l'ouvrir. Ça ne marche pas.
3. Ne rien expliquer encore. Laisser la question : pourquoi ?

## 00:08–00:20 · Le concept, trois affirmations
1. **Un site, c'est des fichiers.** Le starter en a deux. Rien de plus mystérieux.
2. **Une URL, c'est un ordinateur qui donne ces fichiers à qui les demande.** Le tien ne le fait pas, et il est éteint la nuit. Cloudflare a des ordinateurs pour ça, gratuits.
3. **Déployer, c'est copier tes fichiers sur cet ordinateur-là.** Une fois compris, tu ne penses plus jamais « mettre en ligne » comme un truc magique.
Puis la boucle au tableau : je décris → l'agent écrit les fichiers → je copie les fichiers là-bas → URL. Trois flèches.

## 00:20–00:28 · La démo
1. Ouvrir le terminal dans le dossier starter, `claude`.
2. Prompt 1 tel quel, projeté. Regarder l'agent modifier `index.html`. Ouvrir, montrer.
3. Cloudflare : Workers & Pages → Create → Pages → **Upload assets** → nom du projet → glisser le dossier. Attendre. Ouvrir l'URL sur le téléphone, le brandir.
4. Modifier une phrase avec le prompt 2, ré-uploader. « Un changement, c'est ça. »

## 00:28–00:30 · Lancement
Énoncé projeté. Binômes imposés : un qui a le setup complet avec un qui a bloqué. Starter téléchargé depuis la page de séance.

## 00:30–00:57 · Pratique
Circuler. Ne pas taper à la place. Les trois pannes probables sont sur l'énoncé.
À 00:45 : prévenir deux volontaires pour la vitrine.

## 00:57–01:00 · Vitrine
Deux écrans partagés, 60 s chacun. Un qui marche, un qui a cassé si possible. Rappeler : URL dans le groupe = case cochée.

## Après
- Publier le corrigé le soir même (déverrouiller la solution dans l'admin).
- RETEX : combien ont coché toute la DoD ? Sous 60 %, l'exercice est trop dur, pas le groupe.
