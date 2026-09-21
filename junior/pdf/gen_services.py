# -*- coding: utf-8 -*-
"""PDF 2 — Quels services proposer, selon la taille de l'entreprise."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _style import *  # noqa
from reportlab.lib.units import mm

W = CONTENT_W
s = []

s += [para("Ce document répond à une question : qu'est-ce qu'une structure étudiante peut réellement "
           "vendre, à qui, et à quel prix. Il est construit sur un principe simple. "
           "<b>Plus l'entreprise est grande, moins elle achète une livraison, plus elle achète une "
           "expérimentation.</b> Le catalogue ne change pas, c'est la porte d'entrée qui change.", "body")]

s += [callout("La promesse, quelle que soit la taille",
              "Nous automatisons vos processus avec de l'IA, sans créer de problème RGPD. Ce qui est vendu "
              "est le résultat : un dirigeant qui peut expliquer à son avocat, à son délégué à la protection "
              "des données ou à un client où vont ses données. L'hébergement local est un moyen parmi trois, "
              "jamais la promesse.", "done")]

# ---------------------------------------------------------------- catalogue
s += section("1. Le catalogue, quatre offres") + [
      para("Quatre, pas plus. Chacune tient en trois semaines et se démontre en dix minutes. "
           "Forfait, acompte de 30 % à la signature, solde à la recette.", "body")]
s += [table([
    ["Offre", "Livrable", "Prix", "Durée"],
    ["<b>1. État des lieux IA<br/>et dossier</b>",
     "Cartographie des outils d'IA déjà utilisés, déclarés ou non. Dix tâches chronométrées. Tri des "
     "données en quatre catégories. Registre des traitements, durées de conservation, notice "
     "d'information, charte d'usage, point sur la consultation du comité social et économique.",
     "2 500 €", "3 sem."],
    ["<b>2. Assistant sur<br/>vos documents</b>",
     "Un assistant interne qui répond à partir des documents de l'entreprise, avec la source citée à "
     "chaque réponse. Hébergé par défaut sur une interface européenne avec contrat de sous-traitance.",
     "3 500 €", "3 sem."],
    ["<b>3. Outil interne qui<br/>remplace un tableur</b>",
     "Une application web pour un processus précis, en ligne, avec des comptes. Le client possède le "
     "code et les comptes dès le premier jour.",
     "4 500 €", "3 sem."],
    ["<b>4. Automatisation<br/>d'un enchaînement</b>",
     "Un scénario qui relie deux outils déjà utilisés et supprime une saisie manuelle récurrente. "
     "Documentation de reprise en main incluse.",
     "2 500 €", "2 à 3 sem."],
], [33*mm, W-73*mm, 20*mm, 20*mm])]
s += [Spacer(1, 8)]
s += [callout("L'offre 1 est la meilleure du catalogue, et ce n'est pas la plus technique.",
              "Aucun accès aux systèmes, aucune donnée personnelle traitée, aucun livrable à maintenir. "
              "Le risque est nul. Et c'est ce qui manque réellement aux entreprises : pas un modèle, un "
              "dossier présentable à un contrôle ou à un client qui les audite. C'est aussi l'entonnoir "
              "qui vend les trois autres.", "done")]

# ---------------------------------------------------------------- segments
s += section("2. Quatre profils de clients, quatre portes d'entrée")
s += [table([
    ["", "TPE<br/>moins de 10", "PME<br/>10 à 250", "ETI<br/>250 à 5 000", "Grand compte<br/>plus de 5 000"],
    ["<b>Qui décide</b>", "Le dirigeant,<br/>en une réunion",
     "Le dirigeant, parfois<br/>avec un responsable<br/>informatique",
     "Un directeur métier,<br/>puis achats, juridique<br/>et sécurité",
     "Un sponsor nommé,<br/>puis un processus<br/>de référencement"],
    ["<b>Cycle</b>", "1 à 2 semaines", "3 à 6 semaines", "3 à 6 mois", "6 à 12 mois"],
    ["<b>Ce qu'il achète</b>", "Du temps rendu,<br/>à lui personnellement",
     "Du temps rendu<br/>et du risque en moins",
     "Une expérimentation<br/>qu'il peut montrer",
     "Une rencontre avec<br/>des étudiants"],
    ["<b>Budget réaliste</b>", "1 000 à 3 000 €", "2 500 à 6 000 €", "5 000 à 15 000 €", "hors atteinte directe"],
    ["<b>Offres qui marchent</b>", "4 puis 3", "1 puis 2, 3, 4", "1 sur un seul service,<br/>ou 2 en maquette", "atelier, conférence,<br/>challenge étudiant"],
], [26*mm, (W-26*mm)/4, (W-26*mm)/4, (W-26*mm)/4, (W-26*mm)/4])]

# ---------------------------------------------------------------- TPE
s += section("3. Très petites entreprises") + [
      para("Moins de dix salariés. Artisans, commerces, cabinets, agences, restaurants.", "muted"),
      para("Le dirigeant fait lui-même la tâche répétitive. C'est son temps à lui que vous rendez, et il "
           "le sait en trois minutes. Aucun comité social et économique en dessous de onze salariés, aucun "
           "délégué à la protection des données, aucun service achats. La décision se prend en une réunion.", "body"),
      para("Ce qui se vend", "h2")]
s += bullets([
    "<b>L'automatisation d'un enchaînement</b>, offre 4. Reliez deux outils qu'il utilise déjà et supprimez "
    "une saisie. C'est court, c'est visible, c'est payé.",
    "<b>Un outil interne simple</b>, offre 3, quand un tableur partagé est devenu ingérable.",
    "Une version allégée de l'état des lieux, à 1 200 €, sans le dossier de conformité qui ne lui sert à rien.",
])
s += [para("Ce qui ne se vend pas", "h2")]
s += bullets([
    "Le dossier de conformité complet. Pas de comité, pas de délégué, personne à qui le présenter.",
    "Tout hébergement local. Il n'a ni serveur, ni personne pour l'administrer.",
    "Tout ce qui demande un référent interne disponible : il n'y en a pas.",
])
s += [callout("Le vrai risque avec une très petite entreprise n'est pas technique, il est humain.",
              "Le référent, c'est le dirigeant, et il n'a pas le temps. Exigez au cadrage un créneau de "
              "recette bloqué dans son agenda, sinon la mission traîne trois mois. Et prenez l'acompte : "
              "c'est le segment où les impayés sont les plus fréquents.", "streak")]

# ---------------------------------------------------------------- PME
s += section("4. Petites et moyennes entreprises") + [
      para("Dix à deux cent cinquante salariés. C'est votre cœur de cible.", "muted"),
      para("Elle a assez de volume pour que l'automatisation compte, assez de structure pour qu'un "
           "interlocuteur soit disponible, et pas encore de service achats pour bloquer la signature. "
           "Elle a un comité social et économique, obligatoire dès onze salariés, et souvent aucune "
           "consultation faite sur les outils d'IA déjà utilisés.", "body")]
s += [callout("Votre meilleure question d'ouverture, et elle ne vend rien",
              "« Votre comité social et économique a-t-il été consulté sur les outils d'IA déjà utilisés "
              "chez vous ? » La réponse est presque toujours non. Depuis 2025, les tribunaux suspendent des "
              "déploiements pour ce motif, y compris en phase pilote, et la cour d'appel de Paris a jugé en "
              "mai 2026 qu'autoriser un outil et l'encadrer par une charte constitue déjà une introduction "
              "de technologie nouvelle. Vous venez de créer le besoin sans rien proposer.", "accent")]
s += [para("La séquence qui marche", "h2")]
s += bullets([
    "<b>Offre 1</b> en premier, toujours. Elle révèle les outils déjà utilisés en douce, elle produit le "
    "dossier qui manque, et elle vous donne la matière pour proposer la suite.",
    "<b>Offre 2 ou 3</b> ensuite, sur le processus que l'état des lieux a désigné.",
    "<b>Offre 4</b> en complément, souvent vendue en même temps que la 3.",
])
s += [para("Le financement que votre client ignore", "h2"),
      para("Le Diag Data IA de Bpifrance coûte dix mille euros hors taxes, <b>pris en charge à 40 % depuis "
           "juin 2026</b>, soit six mille euros de reste à charge pour huit jours d'expert. Éligibilité à "
           "partir de dix salariés et un million d'euros de chiffre d'affaires. Le mentionner vous positionne "
           "comme quelqu'un qui connaît l'écosystème, et cela peut financer la phase amont de votre mission.", "body")]

# ---------------------------------------------------------------- ETI
s += section("5. Entreprises de taille intermédiaire") + [
      para("Deux cent cinquante à cinq mille salariés. Accessible, mais par une porte précise.", "muted"),
      para("Ici apparaissent le service achats, le juridique, et une revue de sécurité. Un cycle de trois "
           "à six mois tue une structure neuve : vous n'avez pas la trésorerie pour attendre, et votre "
           "interlocuteur aura peut-être changé de poste entre-temps.", "body")]
s += [callout("La porte d'entrée : le budget discrétionnaire d'un directeur métier.",
              "La plupart des entreprises ont un seuil, souvent entre cinq et quinze mille euros, en dessous "
              "duquel un responsable engage une dépense sans passer par les achats. Votre cible n'est pas "
              "l'entreprise, c'est <b>un directeur, un service, et une dépense sous le seuil</b>. Demandez-le "
              "directement : « à partir de quel montant devez-vous passer par vos achats ? » La réponse "
              "définit votre devis.", "accent")]
s += [para("Ce qui se vend", "h2")]
s += bullets([
    "<b>L'état des lieux sur un seul service</b>, pas sur l'entreprise. Le service juridique, le service "
    "client, la comptabilité fournisseurs. Périmètre lisible, budget sous le seuil.",
    "<b>Une maquette</b>, pas une mise en production. Vous démontrez sur des données fictives ce que "
    "l'outil ferait, ils décident ensuite d'industrialiser avec un prestataire plus gros. C'est une "
    "réussite, pas un échec.",
    "<b>Une journée d'atelier interne</b> pour former une équipe à travailler avec des agents. Facile à "
    "acheter, sans engagement technique, et cela crée la relation.",
])
s += [para("Ce qui vous fera perdre six mois", "h2")]
s += bullets([
    "Tout ce qui touche un système de production. La revue de sécurité vous arrêtera.",
    "Tout ce qui exige un niveau d'assurance que vous n'avez pas. Beaucoup exigent une responsabilité "
    "civile professionnelle à un ou deux millions d'euros de couverture. Vérifiez avant, pas après.",
    "Un questionnaire de sécurité fournisseur de cent vingt questions. Si on vous l'envoie, vous n'êtes "
    "pas au bon endroit dans l'organisation : remontez vers un budget discrétionnaire.",
])

# ---------------------------------------------------------------- GC
s += section("6. Grands comptes") + [
      para("Plus de cinq mille salariés. Pas un client direct la première année, et il faut l'assumer.", "muted"),
      para("Référencement fournisseur, portail d'achats, questionnaire de sécurité, accord de "
           "confidentialité, exigences d'assurance, délais de paiement longs. Une structure étudiante de "
           "trois mois n'y survit pas, et un contact grillé ne se rattrape pas.", "body"),
      para("Les quatre portes qui s'ouvrent vraiment", "h2")]
s += [table([
    ["Porte", "Pourquoi ça marche", "Ce que vous vendez"],
    ["<b>L'équipe innovation</b>", "Elle a un budget discrétionnaire et un mandat pour travailler avec "
     "des étudiants. Elle est jugée sur le nombre d'expérimentations, pas sur leur industrialisation.",
     "Une maquette en environnement isolé, sur données synthétiques."],
    ["<b>Les relations écoles</b>", "Budget marque employeur, pas budget prestation. Ils paient pour "
     "rencontrer des étudiants, et c'est une dépense facile à signer.",
     "Un challenge étudiant, une conférence, un atelier."],
    ["<b>La sous-traitance</b>", "Un cabinet déjà référencé vous prend sur une tâche de son marché. "
     "Il porte la responsabilité, l'assurance et la facturation.",
     "Des jours-homme sur un périmètre défini par lui."],
    ["<b>L'introduction personnelle</b>", "Un sponsor nommé qui a le pouvoir de signer court-circuite "
     "le référencement, dans la limite de son seuil.",
     "Un pilote court et périphérique."],
], [33*mm, (W-33*mm)*0.5, (W-33*mm)*0.5])]
s += [Spacer(1, 8)]
s += [callout("Le conseil le plus contre-intuitif de ce document : ne prenez pas le gros client en premier.",
              "Si une relation vous ouvre un grand groupe, ne commencez pas par là. Accord de confidentialité, "
              "revue de sécurité, achats, cycles de six mois : vous n'y survivrez pas, et vous grillerez le "
              "contact. Votre premier client doit être petit, accessible, indulgent, et savoir qu'il est le "
              "premier. Dites-le-lui, et baissez le prix en échange du droit de citer la référence. "
              "Le grand compte viendra en deuxième ou troisième mission, avec des références à montrer.", "accent")]

# ---------------------------------------------------------------- refus
s += section("7. Ce qu'on refuse, à toutes les tailles") + [
      para("Tout ce qui décide à la place d'un humain sur une personne : tri de candidatures, évaluation "
           "de salariés, notation de clients, décision de crédit, santé. Le règlement européen sur l'IA "
           "classe ces usages à haut risque à partir de <b>décembre 2027</b>.", "body")]
s += [callout("Et il y a une raison qui n'est pas que morale.",
              "L'article 25 du règlement fait de vous un <b>fournisseur</b> si vous modifiez la destination "
              "d'un système généraliste pour le rendre à haut risque, ou si vous livrez sous votre marque. "
              "Configurer un modèle pour trier des candidatures suffit à le déclencher. Vous héritez alors "
              "de l'évaluation de conformité, du système de gestion des risques, de la documentation "
              "technique et du marquage CE.", "accent")]
s += [para("Refuser explicitement en rendez-vous est un argument de sérieux, pas un aveu de faiblesse. "
           "Arriver chez un dirigeant en disant « sur ce processus-là, je ne mettrais pas d'IA » est ce qui "
           "vous distingue d'un vendeur.", "body")]

# ---------------------------------------------------------------- modèle livraison
s += section("8. Le modèle de livraison, imposé par les licences")
s += [callout("Le client porte sa licence et son infrastructure. Vous facturez la mise en œuvre.",
              "Ce n'est pas une préférence, c'est une contrainte. La licence de n8n interdit d'héberger les "
              "workflows et identifiants de vos clients chez vous et d'en facturer l'accès. Aider un client à "
              "installer sa propre instance ne demande en revanche aucune licence commerciale de votre côté. "
              "Les alternatives qui autorisent l'hébergement pour compte de tiers sont Activepieces, licence "
              "MIT, et Kestra, Apache 2.0, éditeur français.", "streak")]
s += [para("Ce modèle a trois autres vertus : il supprime votre responsabilité d'hébergeur, il évite qu'une "
           "panne chez vous arrête la production d'un client, et il rend la fin de mission propre.", "body")]

# ---------------------------------------------------------------- qualification
s += section("9. Qualifier un prospect en dix minutes") + [
      para("Sept questions. On ne parle jamais d'IA, on parle de ce qui agace.", "body")]
s += [table([
    ["#", "Question", "Ce qu'elle vous dit"],
    ["1", "Décrivez-moi votre semaine type. Qu'est-ce qui revient tous les jours ?", "La fréquence, condition numéro un"],
    ["2", "Quelle tâche vous fait soupirer quand elle arrive ?", "Le mot exact à réutiliser dans le devis"],
    ["3", "Combien de temps elle prend, et qui la fait ?", "La valeur, et le vrai utilisateur final"],
    ["4", "Qu'est-ce qui se passe si elle est mal faite ?", "Le risque. Plus c'est grave, moins on y touche"],
    ["5", "Où vivent les informations dont elle a besoin ?", "La faisabilité réelle"],
    ["6", "Vous avez déjà essayé de régler ça ?", "Pourquoi ça échouera encore"],
    ["7", "Si je vous rends deux heures par semaine, elles servent à quoi ?", "La justification du prix"],
], [7*mm, (W-7*mm)*0.55, (W-7*mm)*0.45])]
s += [Spacer(1, 8),
      para("Ce qu'on ne demande jamais : « avez-vous un budget IA ». On propose un prix, on ne quête pas "
           "une enveloppe.", "muted"),
      para("La grille d'acceptation", "h2"),
      para("Quatre questions, une seule réponse défavorable disqualifie la mission.", "body")]
s += bullets([
    "<b>Fréquence.</b> Au moins hebdomadaire, sinon le gain ne se voit pas.",
    "<b>Règles.</b> La tâche s'explique en dix phrases. Si elle dépend du flair de quelqu'un, elle n'est pas prête.",
    "<b>Données accessibles.</b> L'information existe en fichiers ou en export. Sinon c'est un projet d'intégration.",
    "<b>Conséquence d'une erreur.</b> Rattrapable par un humain en cinq minutes. Sinon on ne touche pas.",
])

# ---------------------------------------------------------------- prix
s += section("10. Règles de tarification")
s += bullets([
    "<b>Forfait, jamais en régie</b>, sur les douze premières missions. Un forfait borne le risque des deux côtés.",
    "<b>Acompte de 30 % à la signature.</b> Un client qui refuse l'acompte est un client qui ne paiera pas.",
    "<b>La première mission prend 1,5 fois le temps estimé.</b> C'est un investissement, pas une erreur.",
    "<b>Jamais de gratuit.</b> Un projet gratuit n'a pas de priorité chez le client et ne produit pas de "
    "référence utilisable. Une remise de lancement contre le droit de citer la référence, oui.",
    "<b>Ne jamais garantir un résultat chiffré.</b> On s'engage sur un livrable qui fonctionne, pas sur "
    "« 30 % de productivité en plus ».",
])
s += [Spacer(1, 4)]
s += [callout("La ligne à ne jamais franchir",
              "Nous mettons en œuvre selon les règles du RGPD et nous documentons nos choix. La conformité "
              "de votre entreprise reste appréciée par vous et votre conseil. Promettre la conformité, c'est "
              "vendre une prestation juridique sans en avoir le droit ni l'assurance. Cette phrase se répète "
              "en rendez-vous et s'écrit dans les devis.", "accent")]

s += [Spacer(1, 10),
      para("Sources : CNIL, Comité européen de la protection des données, règlement européen sur l'IA et "
           "son règlement modificatif de juillet 2026, jurisprudence des tribunaux judiciaires 2025-2026 sur "
           "la consultation du comité social et économique, catalogues tarifaires OVHcloud et Scaleway, "
           "licences des éditeurs. État au 21 septembre 2026.", "foot")]

build("junior/pdf/AI-bert-Services-aux-entreprises.pdf",
      "Quels services proposer",
      "Le catalogue, et la porte d'entrée selon la taille de l'entreprise",
      s, "Services aux entreprises · document interne")
print("PDF 2 généré")
