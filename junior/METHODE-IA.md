# Méthode · intégrer l'IA en entreprise sans créer de problème

> État du droit et du marché au 19 septembre 2026. Document de travail, pas un conseil juridique.
> Tout ce qui est marqué 🔴 doit être dit au client avant la signature.

## Le fait qui doit changer votre discours

**Le même modèle que vous installeriez sur site tourne sur infrastructure française à 0,08 € le million de jetons en entrée.** OVHcloud sert gpt-oss-120b à ce prix, sans aucun transfert hors Union européenne. ([catalogue OVHcloud](https://www.ovhcloud.com/fr/public-cloud/ai-endpoints/catalog/))

Une PME de cinquante salariés dont trente utilisent l'IA consomme environ soixante millions de jetons par mois. Le seuil à partir duquel une station locale devient rentable face à cette offre se situe autour de **mille cinq cents millions**. Elle en est à un vingt-sixième.

**Conséquence : ne vendez jamais le local par l'argument du coût, et ne le vendez pas par défaut.** Le premier prospect qui fait le calcul devant vous détruit votre crédibilité entière.

## Ce que le local règle, et ce qu'il ne règle pas

| Question | Le local la règle ? |
|---|---|
| Transfert hors Union européenne | **Oui**, totalement |
| Réutilisation des données par le fournisseur | **Oui** |
| Exposition aux lois extraterritoriales | **Oui**, si toute la chaîne est hors emprise |
| Base légale du traitement | Non |
| Information des personnes | Non |
| Droits d'accès, rectification, effacement | Non |
| Minimisation et durées de conservation | Non |
| Analyse d'impact | Non |
| Exactitude des réponses | Non |
| Licéité de l'entraînement du modèle | **Non** |
| Obligations du règlement européen sur l'IA | Non |
| Consultation du comité social et économique | Non |
| Sécurité du système | **Non, et c'est souvent pire** |

Douze questions, le local en règle trois. Celle que le dirigeant comprend en dix secondes, et deux autres.

**Sur la licéité de l'entraînement**, le Comité européen de la protection des données est explicite : un modèle développé à partir de données traitées illicitement peut contaminer la licéité de son déploiement. Télécharger un modèle ouvert et le faire tourner à Lyon **ne purge rien**. ([EDPB, avis 28/2024](https://www.edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-282024-certain-data-protection-aspects_en))

**Sur la sécurité, l'argument se retourne complètement.** Cent soixante-quinze mille instances Ollama sont exposées publiquement dans cent trente pays, dont la France, et près de la moitié permettent l'exécution de code. La vulnérabilité dite « Bleeding Llama » a touché environ trois cent mille serveurs accessibles depuis internet, permettant à un attaquant non authentifié de lire la mémoire du processus : invites système, historiques, clés d'API, données clients. ([The Hacker News](https://thehackernews.com/2026/01/researchers-find-175000-publicly.html), [CSO Online](https://www.csoonline.com/article/4168584/ollama-vulnerability-highlights-danger-of-ai-frameworks-with-unrestricted-access.html))

Cause racine : Ollama n'a **aucune authentification native**, et une seule variable d'environnement suffit à tout exposer.

🔴 **Un serveur d'IA locale mal configuré est un incident de données à lui tout seul, sans contrat, sans assurance, et sans personne à blâmer que l'intégrateur.** Si vous installez du local, le durcissement et l'exploitation se facturent. Sinon ne l'installez pas.

## Les trois arguments qui ouvrent vraiment les portes

### 1. Le droit du travail, et il est italien

> **La structure est à Milan.** Ce qui suit décrit le cadre français, conservé parce que vos
> clients peuvent être français. **Pour l'Italie, l'équivalent est plus fort encore** :
> l'article 4 du Statuto dei Lavoratori exige un accord syndical ou une autorisation de
> l'inspection du travail avant tout outil permettant un contrôle à distance des salariés,
> sous sanction **pénale**. S'y ajoutent le décret transparence et la loi italienne sur l'IA
> d'octobre 2025, première du genre dans l'Union. Détail dans `junior/FORMALITES-IT.md`,
> section 7.

**En France, c'est le risque le plus immédiat pour votre client, et le meilleur argument de vente.** Plus immédiat que le RGPD, parce que la sanction est visible : un juge arrête le déploiement.

L'article L. 2312-8 du code du travail impose d'informer et consulter le comité sur l'introduction de nouvelles technologies. La jurisprudence de 2025 et 2026 est sévère et constante :

| Décision | Ce qu'elle établit |
|---|---|
| Tribunal judiciaire de Nanterre, février 2025 | Une **phase pilote** avec usage réel par des salariés est déjà une mise en œuvre |
| Tribunal judiciaire de Créteil, juillet 2025 | **Suspension ordonnée** de l'usage des outils d'IA jusqu'à consultation achevée |
| Tribunal judiciaire de Paris, septembre 2025 | Une plateforme d'IA est une technologie nouvelle imposant la consultation |
| Tribunal judiciaire de Nanterre, janvier 2026 | Remplacer un logiciel existant par un outil à IA déclenche l'obligation. **Suspension immédiate, y compris en pilote** |
| Cour d'appel de Paris, mai 2026 | Autoriser un outil et l'encadrer par une charte **constitue une introduction** de technologie nouvelle |

Le critère retenu n'est pas la présence d'IA, c'est **l'effet sur le travail**.

**Comment l'utiliser en rendez-vous.** Une question : « votre comité social et économique a-t-il été consulté sur les outils d'IA déjà utilisés chez vous ? » Dans la grande majorité des PME la réponse est non, et vous venez de créer le besoin sans rien vendre.

### 2. Les lois extraterritoriales, avec une source imparable

Le 10 juin 2025, devant une commission du Sénat français, le directeur des affaires publiques et juridiques de Microsoft France a répondu **sous serment « Non, je ne peux pas le garantir »** à la question de savoir si les données de citoyens français ne seraient jamais transmises aux autorités américaines.

C'est public, daté, et cela vient du fournisseur lui-même. Aucun argument construit par vous n'aura cette force.

### 3. Le cadre de transfert est valide, mais il a déjà été annulé deux fois

L'accord de transfert entre l'Union et les États-Unis est en vigueur et a été validé par le Tribunal de l'Union en septembre 2025. **Un pourvoi est pendant devant la Cour de justice.** Les deux mécanismes précédents, Safe Harbor puis Privacy Shield, ont été annulés par cette même juridiction.

C'est un argument de **gestion du risque**, pas de non-conformité actuelle. Ne dites jamais qu'un client en infraction ; dites qu'il construit sur un socle qui a été retiré deux fois.

## Le règlement européen sur l'IA : ce qui est vrai en septembre 2026

🔴 **Le calendrier a changé le 27 juillet 2026** et la quasi-totalité du contenu en ligne propage encore l'ancien. Le règlement 2026/1744, dit Digital Omnibus, a reporté les obligations des systèmes à haut risque. ([texte au Journal officiel de l'Union](https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng))

| Depuis | Quoi |
|---|---|
| Février 2025 | Pratiques interdites, maîtrise de l'IA |
| Août 2025 | Modèles à usage général, gouvernance, **sanctions** |
| **Août 2026** | **Obligations de transparence de l'article 50**, application générale |
| Décembre 2026 | Deux nouvelles interdictions |
| **Décembre 2027** | **Haut risque de l'annexe III** : recrutement, crédit, éducation, gestion des travailleurs |
| Août 2028 | Haut risque intégré à des produits réglementés |

**Ne dites jamais « le haut risque arrive en août 2026 ».** C'est décembre 2027.

Sanctions : jusqu'à 35 millions d'euros ou 7 % du chiffre d'affaires mondial pour les pratiques interdites. **Pour les PME, c'est le montant le plus faible des deux qui s'applique**, pas le plus élevé.

### 🔴 Le piège qui vous concerne directement : devenir fournisseur

L'article 25 transforme un intégrateur en **fournisseur** dans trois cas, dont deux vous guettent :

- vous **apposez votre marque** sur un système à haut risque ;
- vous **modifiez la destination** d'un système, y compris fondé sur un modèle généraliste, de sorte qu'il devient à haut risque.

**Configurer un modèle généraliste pour trier des candidatures suffit à déclencher le troisième cas.** Vous devenez alors responsable de l'évaluation de conformité, du système de gestion des risques, de la documentation technique et du marquage CE.

C'est la raison technique, et pas seulement morale, pour laquelle le catalogue exclut tout ce qui décide sur des personnes.

Bonne nouvelle à dire aux clients : le seuil à partir duquel un affinage de modèle fait de vous un fournisseur de modèle généraliste est hors d'atteinte d'une PME, de plusieurs ordres de grandeur.

## Le vrai produit : le dossier, pas le serveur

Ce qui manque à toutes les PME, ce n'est pas un modèle. C'est **le dossier qu'on présente à un contrôle, à un délégué à la protection des données, ou à un client grand compte qui les audite**.

Ce dossier est livrable par des étudiants encadrés, il ne demande aucun matériel, et il ne porte presque aucun risque technique :

1. **La cartographie des outils déjà utilisés.** Il y a toujours de l'IA en usage non déclaré. C'est le premier livrable et il surprend toujours le dirigeant.
2. **Le tri des données en quatre catégories**, processus par processus. Voir `junior/POSITIONNEMENT.md`.
3. **Le registre des traitements**, obligatoire quelle que soit la taille. La CNIL considère elle-même que l'exemption des moins de deux cent cinquante salariés a une portée très limitée.
4. **Les durées de conservation**, y compris des historiques de conversation et des journaux d'invites. Presque aucun déploiement ne le fait.
5. **La notice d'information** des personnes concernées.
6. **L'analyse d'impact** quand elle s'impose. Elle est en pratique toujours requise dès qu'un assistant génératif touche des données de salariés, de patients ou de clients identifiables.
7. **La charte d'usage interne** et la formation des utilisateurs.
8. **Le dossier de consultation du comité social et économique.**

🔴 **Et la formule à répéter, en rendez-vous comme dans les devis :** nous mettons en œuvre selon les règles et nous documentons nos choix. La conformité de l'entreprise reste appréciée par elle et son conseil. Vous n'êtes pas juristes.

## Choisir la voie technique

### La règle

| Voie | Quand |
|---|---|
| **Interface hébergée dans l'Union, avec contrat de sous-traitance** | Défaut. Information d'entreprise ou données personnelles ordinaires |
| **Exécution sur les machines du client** | Contrainte réglementaire ou contractuelle absolue, secret des affaires, charge massive et prévisible, ou matériel déjà amorti |
| **Pas d'IA sur ce processus** | La donnée est trop sensible, ou une règle simple suffit |

Trois cas seulement justifient le local, **et aucun n'est financier**.

### Si vous faites du local malgré tout

**Modèles.** S'en tenir aux licences Apache 2.0 : Ministral 3, Mistral Small 4, Gemma 4, Granite 4.2, gpt-oss. Elles couvrent tous les besoins d'une PME.

🔴 **Pièges de licence à connaître**, parce qu'ils mettent le client en infraction :
- **Les embeddings Jina sont en licence non commerciale.** Très utilisés, et interdits en entreprise.
- **Voxtral TTS de Mistral** est non commercial également.
- Llama impose la mention « Built with Llama » partout.
- Qwen3.8-Flash-Next exige une licence séparée pour exposer l'inférence à des tiers.

**Embeddings.** BGE-M3, licence MIT, huit mille jetons de contexte. Les modèles à cinq cent douze jetons tronquent silencieusement tout passage de plus de trois cent cinquante mots français.

**Quantification.** Q4_K_M coûte un demi pour cent de qualité pour soixante-neuf pour cent de mémoire économisée. **Ne jamais descendre en dessous.**

**Matériel, prix France septembre 2026.** Le marché est anormal, pénurie de mémoire et annulation des cartes intermédiaires. Un Mac Studio à quatre-vingt-seize gigaoctets de mémoire unifiée coûte 6 599 € en machine complète, quand la carte professionnelle équivalente coûte 13 999 € seule.

**Et surtout : l'administration représente la moitié du coût réel du local**, poste que tous les comparatifs omettent. Deux heures par mois est une hypothèse optimiste.

### Outils, et leur licence

| Outil | Licence | Ce qu'il faut savoir |
|---|---|---|
| **Ollama** | MIT | Aucune authentification native. Une requête à la fois par défaut. 🔴 Les modèles suffixés `:cloud` **envoient les invites chez Ollama** |
| **llama.cpp** | MIT | Bon compromis, seul moteur vraiment optimisé pour Apple |
| **vLLM** | Apache 2.0 | Excellent au-delà de vingt utilisateurs simultanés, demande un vrai administrateur |
| **LM Studio** | **Propriétaire** | Gratuit au travail, mais 🔴 **interdit de l'héberger comme service pour des tiers** |
| **LibreChat** | MIT | L'interface sans clause de marque |
| **Open WebUI** | Licence maison | Clause de marque au-delà de cinquante utilisateurs. 🔴 Trois défauts à corriger à l'installation : l'API OpenAI activée par défaut, un modèle d'embedding anglophone, et l'exécution de code distant autorisée |
| **Qdrant** | Apache 2.0 | Base vectorielle, le pari le plus sûr à trois ans |

### Automatisation : le point qui décide de votre modèle de livraison

🔴 **La licence de n8n interdit d'héberger des workflows et des identifiants clients chez vous et de facturer l'accès.** Il faut une licence entreprise pour cela.

En revanche, **aider un client à installer sa propre instance ne demande aucune licence commerciale de votre côté**. C'est le modèle à adopter : **le client porte sa licence et son infrastructure, vous facturez la mise en œuvre.**

Les alternatives qui autorisent l'hébergement pour compte de tiers : **Activepieces**, licence MIT, et **Kestra**, Apache 2.0, éditeur français, mode totalement hors ligne documenté.

Chez n8n, le point à dire avant le devis : **l'authentification unique et la traçabilité d'audit ne sont pas gratuites**, même en auto-hébergement.

**Et le rappel honnête :** même en auto-hébergement total, **les connecteurs sortent par nature**. Un scénario qui lit une boîte mail et écrit dans un logiciel commercial fait sortir les données, où que tourne l'orchestrateur.

## Pourquoi les projets échouent

Quatre-vingt-quinze pour cent des pilotes d'IA générative en entreprise ne produisent aucun effet mesurable sur le compte de résultat, selon une étude du MIT de 2025 dont la méthodologie a été contestée, mais dont un chiffre mérite attention : **les pilotes mêlant équipe interne et expertise externe réussissent à soixante-sept pour cent, contre vingt-deux pour cent pour ceux portés par la seule direction informatique**. C'est exactement votre créneau.

Gartner prévoit l'annulation de plus de quarante pour cent des projets d'IA agentique d'ici fin 2027.

Les causes récurrentes, toutes transposables en PME : périmètre trop large d'emblée, aucune mesure de la valeur avant lancement, qualité des données sous-estimée, aucune révision humaine sur un livrable engageant, substitution au lieu d'augmentation, et environnements de test jamais décommissionnés. C'est ainsi que les données de soixante-quatre millions de candidats d'un grand groupe de restauration rapide ont été exposées en 2025 : un compte de test de 2019 avec le mot de passe « 123456 ».

## Le financement que votre client ignore

Le **Diag Data IA de Bpifrance** coûte dix mille euros hors taxes, **pris en charge à quarante pour cent depuis juin 2026**, soit six mille euros de reste à charge pour huit jours d'expert. Éligibilité à partir de dix salariés et un million d'euros de chiffre d'affaires.

Le mentionner en rendez-vous vous positionne immédiatement comme quelqu'un qui connaît l'écosystème, et cela peut financer la phase amont de votre propre mission.

## Points non vérifiés

Les numéros de rôle des décisions de tribunal citées viennent d'une synthèse doctrinale et n'ont pas été recoupés sur une base primaire. Aucun benchmark francophone fiable et à jour n'existe : constituez trente à cinquante exemples tirés des documents réels du client et comparez les modèles dessus, c'est un après-midi et c'est infiniment plus décisif qu'un score. Aucune action d'exécution du règlement sur l'IA ne semble publiquement documentée à ce jour, ce qui est une absence de preuve et non une preuve d'absence.
