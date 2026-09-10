# S03 — Git as a safety net · conducteur

Victoire de fin d'heure : le projet est sur GitHub avec un historique, un retour arrière visible, et Cloudflare redéploie tout seul à chaque push.
Notion unique : un commit est un point de sauvegarde. Branche et revert en corollaire. Pas de théorie git au-delà.

## Avant la séance
- Ouvrir la séance 3 dans l'admin.
- Compte GitHub de démo prêt, dépôt vide `demo-s03` créé d'avance.
- Un projet Cloudflare Pages de démo à connecter à ce dépôt.
- Vérifier que `git --version` répond sur la machine de démo.
- Contrôle à l'entrée : `gh auth status` chez chaque étudiant. Ceux qui n'ont pas fait le devoir « avant la séance 3 » rejoignent un binôme.
- Pratique réaliste : 30 à 35 min. La DoD s'arrête aux commits et à l'annulation ; Cloudflare est en bonus.

## 00:00–00:03 · Accueil
« Ce soir, on rend impossible de perdre son travail. À 00:60, casser votre site n'aura plus aucune importance. »

## 00:03–00:08 · L'échec
1. Sur la page S02, prompt : « Redesign the whole page with a dark theme, a menu and three sections ». Laisser l'agent réécrire tout.
2. Ouvrir. C'est cassé, ou moche, ou les deux. « Je veux revenir à avant. » Cmd+Z ne fait rien, les fichiers ont été réécrits.
3. Silence. « Où est la version d'il y a deux minutes ? Nulle part. »
4. Si quelqu'un cite `/rewind` ou double Échap : le montrer, puis fermer le terminal et rouvrir. Plus de checkpoint. Le filet de Claude vit dans la session ; git vit dans le projet, sur GitHub, et redéploie.

## 00:08–00:20 · Le concept, trois affirmations
1. **Un commit est un point de sauvegarde nommé.** Comme une sauvegarde de jeu. Tu en fais un avant chaque chose risquée, donc tout le temps.
2. **Revenir en arrière est une commande, pas un drame.** `git restore` pour annuler ce qui n'est pas encore sauvegardé, `git revert` pour annuler une sauvegarde. Rien n'est jamais perdu, c'est le contrat.
3. **GitHub est la copie ailleurs, et ton portfolio.** Ton disque peut mourir. Et un recruteur qui ouvre ton profil voit des commits datés, pas des promesses.
Au tableau : fichiers → commit → commit → commit, une flèche « revert » qui remonte. Puis une flèche vers GitHub, puis GitHub → Cloudflare.

## 00:20–00:28 · La démo
1. Dans le dossier S02 : `git init -b main`, `git add .`, `git commit -m "Page after step 02"`. Montrer `git log`.
2. Refaire le redesign destructeur. Constater. `git restore .` Tout revient. Applaudissements attendus.
3. Refaire un vrai petit changement, commit. `git push` vers le dépôt GitHub. Montrer l'historique sur le site GitHub.
4. Cloudflare : Create → Pages → Connect to Git → un NOUVEAU projet, l'ancien nom est pris, l'URL change ce soir. Aucune commande de build, output `/`. Attendre. Changer un mot, commit, push : le site se met à jour seul. C'est le bonus des étudiants, pas leur DoD.

## 00:28–00:30 · Lancement
Énoncé projeté. Prévenir : l'agent peut faire les commandes git pour vous, mais lisez ce qu'il fait.

## 00:30–00:57 · Pratique
Pièges : dossier ouvert au mauvais endroit, push refusé faute de connexion GitHub, oubli de `git add`. Les trois sont sur l'énoncé. À 00:45, deux volontaires.

## 00:57–01:00 · Vitrine
Montrer un historique GitHub avec un revert dedans. Demander : qu'est-ce qui vous a fait peur avant et plus maintenant ?

## Après
Corrigé déverrouillé. RETEX. Le concours 1 est dans huit jours : l'annoncer.
