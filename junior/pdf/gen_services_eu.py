# -*- coding: utf-8 -*-
"""PDF — Services à l'échelle européenne, depuis Milan."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _style import *  # noqa
from reportlab.lib.units import mm

W = CONTENT_W
s = []

s += [para("Ce document répond à une question : que vendre, dans quel pays d'Europe, et par quelle porte. "
           "Il repose sur une observation qui structure tout le reste. <b>Ce qui bloque un projet d'IA en "
           "entreprise n'est presque jamais la technique. C'est une instance représentative du personnel qui "
           "doit donner son accord, et dont le pouvoir varie énormément d'un pays à l'autre.</b> "
           "Dans deux pays d'Europe, elle peut purement et simplement dire non.", "body")]

s += [callout("La thèse, en une phrase",
              "Plus un pays est contraignant, plus il est vendeur. Une friction réglementaire n'est pas un "
              "obstacle commercial, c'est un besoin solvable : le client paie pour être débloqué. Vous vendez "
              "le déblocage, vous livrez l'automatisation avec.", "done")]

# ---------------------------------------------------------------- 1
s += section("1. Ce qui est uniforme, ce qui ne l'est pas")
s += [table([
    ["Uniforme dans l'Union", "National, et c'est là qu'est votre valeur"],
    ["Le RGPD : base légale, information, droits des personnes, contrat de sous-traitance, registre, "
     "analyse d'impact.<br/><br/>"
     "Le règlement européen sur l'IA : pratiques interdites, transparence de l'article 50 depuis août 2026, "
     "haut risque en <b>décembre 2027</b> et non août 2026.<br/><br/>"
     "La TVA entre professionnels : autoliquidation chez le client.",
     "<b>Le droit du travail.</b> Qui doit être consulté, qui peut dire non, sous quelle sanction.<br/><br/>"
     "Les lois nationales sur l'IA. L'Italie a la première de l'Union depuis octobre 2025.<br/><br/>"
     "Les autorités de protection des données, dont l'agressivité varie du simple au décuple.<br/><br/>"
     "La facturation et ses formats."],
], [W/2, W/2])]
s += [Spacer(1, 8),
      para("Conséquence pratique : <b>votre méthode est européenne, votre argumentaire est national.</b> "
           "Le tri des données en quatre catégories, le choix entre hébergement européen et local, le "
           "registre et le contrat de sous-traitance se transposent tels quels. La phrase d'ouverture du "
           "rendez-vous, elle, change à chaque frontière.", "body")]

# ---------------------------------------------------------------- 2
s += section("2. La carte du pouvoir de blocage")
s += [para("Du plus contraignant au moins contraignant. C'est aussi, dans cet ordre, la valeur de votre "
           "offre.", "body")]
s += [table([
    ["Pays", "Pouvoir de l'instance", "Déclencheur", "Sanction"],
    ["<b>Allemagne</b>", "<b>Codétermination.</b> Véritable veto. En cas de désaccord, une commission "
     "d'arbitrage tranche de façon <b>contraignante</b>",
     "Il suffit que l'outil soit <b>capable</b> de surveiller le comportement ou la performance. "
     "L'intention de surveiller n'est pas requise",
     "Mesure inopposable, contentieux devant le tribunal du travail"],
    ["<b>Pays-Bas</b>", "<b>Consentement préalable.</b> Sans accord, l'employeur ne peut pas déployer",
     "Un dispositif <b>conçu pour ou apte à</b> observer ou contrôler la présence, le comportement ou la "
     "performance",
     "Décision nulle, suspension judiciaire"],
    ["<b>Italie</b>", "Accord syndical, ou à défaut <b>autorisation de l'inspection du travail</b>",
     "Tout instrument dont peut découler une possibilité de contrôle à distance",
     "<b>Sanction pénale</b>, et preuves obtenues inutilisables"],
    ["<b>France</b>", "Consultation obligatoire. Pas de veto, mais les juges <b>suspendent</b> les "
     "déploiements faits sans elle, y compris en phase pilote",
     "L'introduction d'une technologie nouvelle, appréciée par son <b>effet sur le travail</b>",
     "Suspension judiciaire, délit d'entrave"],
    ["<b>Espagne</b>", "Droit d'information, pas de veto",
     "Les <b>paramètres, règles et instructions</b> des algorithmes affectant les conditions de travail, "
     "l'accès à l'emploi et son maintien, y compris le profilage",
     "Sanction administrative, contentieux"],
    ["<b>Suisse et<br/>Royaume-<br/>Uni</b>", "Hors cadre de l'Union sur la représentation du personnel, nettement "
     "moins contraignant",
     "—", "—"],
], [24*mm, (W-24*mm)*0.30, (W-24*mm)*0.40, (W-24*mm)*0.30])]
s += [Spacer(1, 8)]
s += [callout("Le détail qui change tout, en Allemagne et aux Pays-Bas",
              "Le déclencheur n'est pas l'intention de surveiller, c'est la <b>capacité</b> de le faire. "
              "Un outil vendu pour améliorer la productivité, qui produit au passage des statistiques par "
              "salarié, tombe dans le champ même si personne ne veut surveiller qui que ce soit. "
              "La quasi-totalité des logiciels d'IA appliqués au travail sont concernés, et la quasi-totalité "
              "des dirigeants l'ignorent.", "accent")]
s += [para("<b>À vérifier.</b> Les seuils d'effectif à partir desquels l'instance existe varient par pays et n'ont pas été "
           "vérifiés dans ce document. Faites-les confirmer avant de cibler un segment : ils déterminent "
           "quels clients sont concernés.", "muted")]

# ---------------------------------------------------------------- 3
s += section("3. Les marchés, un par un")

s += [para("Allemagne — le plus contraignant, donc le plus vendeur", "h2"),
     para("Le comité d'entreprise dispose d'un droit de <b>codétermination</b> sur l'introduction et "
          "l'usage de tout dispositif technique permettant de surveiller le comportement ou la performance "
          "des salariés. Ce n'est pas une consultation : sans accord, l'outil ne se déploie pas, et en cas "
          "de blocage une commission d'arbitrage rend une décision contraignante.", "body"),
     para("La jurisprudence est constante depuis des décennies et couvre désormais explicitement les "
          "logiciels d'analyse fondés sur l'IA, l'évaluation automatisée des performances, la surveillance "
          "des messageries, les outils de prédiction et les systèmes qui optimisent les flux de travail.", "body"),
     para("<b>Ce que vous vendez.</b> La qualification de l'outil, le dossier technique compréhensible par "
          "des représentants non techniciens, et l'accord d'entreprise négocié. Un projet allemand bloqué en "
          "commission peut l'être des mois : le déblocage a une valeur immédiate et chiffrable.", "body")]

s += [para("Pays-Bas — le consentement, pas la consultation", "h2"),
     para("Le conseil d'entreprise a un <b>droit de consentement</b> sur les règlements relatifs au "
          "traitement de données personnelles et sur les systèmes de suivi du personnel. Le critère est "
          "large : un dispositif <b>conçu pour ou simplement apte à</b> observer présence, comportement ou "
          "performance. Sans consentement, l'employeur ne peut pas mettre en œuvre.", "body"),
     para("<b>Pourquoi c'est un bon marché pour vous.</b> Les entreprises néerlandaises sont parmi les plus "
          "avancées d'Europe sur l'adoption d'outils numériques, l'anglais y est la langue de travail "
          "courante, et le droit de consentement crée exactement la friction que vous savez traiter.", "body")]

s += [para("Italie — votre marché domestique, et le seul avec une sanction pénale", "h2"),
     para("Accord syndical, ou à défaut autorisation de l'inspection du travail, pour tout instrument dont "
          "peut découler un contrôle à distance. La violation est <b>pénalement sanctionnée</b> et les "
          "preuves obtenues sont inutilisables, ce qui prive l'employeur de tout usage disciplinaire.", "body"),
     para("S'y ajoutent le décret transparence, qui impose de documenter jusqu'aux <b>paramètres "
          "d'entraînement</b> du système, et la <b>première loi nationale sur l'IA de l'Union</b>, en "
          "vigueur depuis octobre 2025, qui impose formation des salariés et garantie qu'un humain puisse "
          "toujours corriger, suspendre ou arrêter le système.", "body")]

s += [para("France — pas de veto, mais des juges qui arrêtent les déploiements", "h2"),
     para("La consultation du comité social et économique est obligatoire avant l'introduction d'une "
          "technologie nouvelle. Le pouvoir n'est pas un veto, mais depuis 2025 les tribunaux <b>suspendent "
          "les déploiements</b> faits sans elle, y compris en phase pilote, et une cour d'appel a jugé "
          "qu'autoriser un outil et l'encadrer par une charte constitue déjà une introduction.", "body"),
     para("<b>Le critère retenu n'est pas la présence d'IA, c'est l'effet sur le travail.</b> C'est plus "
          "large que ce que croient les dirigeants.", "body")]

s += [para("Espagne — l'information sur les algorithmes, un angle différent", "h2"),
     para("Depuis 2021, le comité d'entreprise a le droit d'être informé des <b>paramètres, règles et "
          "instructions</b> sur lesquels reposent les algorithmes ou systèmes d'IA affectant les décisions "
          "susceptibles d'influer sur les conditions de travail, l'accès à l'emploi et son maintien, y "
          "compris le profilage.", "body"),
     para("Pas de veto, donc une friction moindre. Mais l'obligation porte sur un contenu que presque aucun "
          "intégrateur ne sait produire : expliquer en langage clair la logique et les paramètres d'un "
          "système. <b>C'est un livrable, et vous savez le faire.</b>", "body")]

s += [para("Suisse et Royaume-Uni — plus simples qu'on ne le croit", "h2"),
     para("Sur les données, les deux bénéficient d'une décision d'adéquation de la Commission européenne. "
          "Celle du Royaume-Uni a été <b>renouvelée en décembre 2025 jusqu'à fin 2031</b>. "
          "Conséquence concrète : <b>transférer des données vers ces deux pays ne demande aucune clause "
          "contractuelle type</b>, contrairement aux États-Unis. C'est un argument de simplicité à connaître.", "body"),
     para("Sur la représentation du personnel, les contraintes y sont nettement plus faibles. Ce sont donc "
          "des marchés où votre argument de déblocage porte moins, mais où votre offre d'automatisation "
          "reste vendable sur sa valeur propre.", "body")]

# ---------------------------------------------------------------- 4
s += section("4. L'offre, et sa déclinaison par pays") + [
    para("Le catalogue ne change pas. C'est la première phrase du rendez-vous qui change.", "body"),
]
s += [table([
    ["Pays", "La question d'ouverture, qui ne vend rien et crée le besoin"],
    ["<b>Allemagne</b>", "« Votre comité d'entreprise a-t-il donné son accord sur les outils d'IA déjà "
     "utilisés ? Saviez-vous qu'il suffit que l'outil <i>puisse</i> surveiller, même sans que ce soit "
     "l'intention ? »"],
    ["<b>Pays-Bas</b>", "« Votre conseil d'entreprise a-t-il consenti au déploiement ? Le critère est "
     "l'aptitude de l'outil à observer, pas son objectif. »"],
    ["<b>Italie</b>", "« Avez-vous un accord syndical ou une autorisation de l'inspection sur les outils "
     "déjà en place ? La violation est pénale, et les preuves deviennent inutilisables. »"],
    ["<b>France</b>", "« Votre comité social et économique a-t-il été consulté sur les outils d'IA déjà "
     "utilisés ? Depuis 2025 les juges suspendent, même en phase pilote. »"],
    ["<b>Espagne</b>", "« Pouvez-vous expliquer à votre comité les paramètres et les règles de vos "
     "algorithmes ? C'est une obligation depuis 2021. »"],
], [24*mm, W-24*mm])]
s += [Spacer(1, 8)]
s += [callout("L'offre qui porte tout : « IA conforme au poste de travail »",
              "Qualification de l'outil au regard du texte national applicable. Préparation du dossier "
              "destiné à l'instance représentative, rédigé pour des non-techniciens. Note d'information sur "
              "la logique du système et ses paramètres. Registre de sous-traitant et contrat de "
              "sous-traitance. Note sur le contrôle humain. Support de formation des salariés.<br/><br/>"
              "<b>Trois mille euros, trois semaines, et c'est ce qui débloque le projet.</b> "
              "L'automatisation se vend ensuite, à un client qui vous fait déjà confiance.", "done")]

# ---------------------------------------------------------------- 5
s += section("5. Vendre hors d'Italie, la mécanique")
s += [table([
    ["Sujet", "Ce qu'il faut savoir"],
    ["<b>TVA</b>", "Client professionnel dans un autre pays de l'Union : facture <b>sans TVA italienne</b>, "
     "mention d'autoliquidation, le client la déclare chez lui. <b>Vérifiez son numéro sur le registre "
     "européen avant d'émettre</b> et gardez la preuve : un numéro invalide rend l'opération interne et la "
     "TVA devient votre problème. Client suisse ou britannique : opération hors champ."],
    ["<b>Droit applicable</b>", "Les parties professionnelles choisissent librement le droit du contrat. "
     "À défaut de choix, c'est celui du <b>pays du prestataire</b>, donc l'Italie. <b>Écrivez-le "
     "explicitement</b> dans vos conditions générales, avec le tribunal compétent : c'est une ligne qui "
     "évite un contentieux à l'étranger."],
    ["<b>Transfert de données</b>", "Vers le Royaume-Uni et la Suisse : <b>aucune formalité</b>, décision "
     "d'adéquation en vigueur, celle du Royaume-Uni renouvelée jusqu'en 2031. Vers les États-Unis : "
     "encadrement nécessaire. C'est une différence à connaître quand vous choisissez un outil."],
    ["<b>Langue</b>", "L'anglais suffit aux Pays-Bas et dans les grandes entreprises allemandes. "
     "En Italie, en Espagne et en France, la langue locale est attendue, au moins pour les documents "
     "destinés aux représentants du personnel. <b>Un dossier syndical en anglais ne passe pas.</b>"],
    ["<b>Livraison à distance</b>", "Tout votre catalogue se livre en visioconférence, sauf la restitution "
     "de l'état des lieux et la séance avec les représentants du personnel. Comptez un déplacement par "
     "mission hors d'Italie, et facturez-le."],
], [30*mm, W-30*mm])]

# ---------------------------------------------------------------- 6
s += section("6. Les trois marchés à attaquer, et dans cet ordre") + [
    para("<b>1. L'Italie, parce que c'est chez vous.</b> Marché domestique, langue, réseau, densité de "
         "petites et moyennes entreprises industrielles en Lombardie, et la seule sanction pénale d'Europe "
         "sur le sujet. Vos six premières missions doivent être italiennes : vous avez besoin de références "
         "avant de traverser une frontière.", "body"),
    para("<b>2. L'Allemagne, parce que c'est là que la friction vaut le plus cher.</b> Un droit de veto "
         "réel, un arbitrage contraignant, une culture d'entreprise qui traite la conformité comme un "
         "prérequis et non comme une contrainte, et un tissu de moyennes entreprises industrielles qui "
         "ressemble beaucoup au vôtre. C'est le marché où votre offre vaut le plus, et c'est aussi le plus "
         "exigeant sur la qualité du dossier : n'y allez pas avant d'avoir livré cinq missions.", "body"),
    para("<b>3. Les Pays-Bas, parce que c'est le plus facile à pénétrer.</b> Consentement obligatoire donc "
         "friction réelle, anglais comme langue de travail, forte adoption du numérique, et des cycles de "
         "décision plus courts qu'en Allemagne. C'est le bon second marché étranger, et probablement celui "
         "où une structure étudiante sera prise au sérieux le plus vite.", "body"),
]
s += [callout("Ce que je ne recommande pas en premier",
              "La France, malgré la langue, parce que la friction y est moindre qu'en Allemagne ou aux "
              "Pays-Bas et que vous n'y avez aucune présence. L'Espagne, parce que le droit d'information "
              "sans veto crée un besoin plus faible. Et le Royaume-Uni ou la Suisse, où votre argument "
              "central porte peu : vous y seriez un prestataire d'automatisation parmi d'autres, sans votre "
              "différence.", "streak")]

# ---------------------------------------------------------------- 7
s += section("7. Ce qui reste à vérifier avant de démarcher") + [
    para("Ce document donne la structure du raisonnement et les mécanismes juridiques. Cinq points doivent "
         "être confirmés avant un premier rendez-vous dans un pays donné, parce qu'une erreur sur l'un "
         "d'eux détruit votre crédibilité en une phrase.", "body"),
]
s += bullets([
    "<b>Les seuils d'effectif</b> à partir desquels l'instance représentative existe, pays par pays. Ils "
    "déterminent quels clients sont concernés.",
    "<b>Les sanctions exactes</b>, montants et nature, du pays visé.",
    "<b>La jurisprudence récente</b> du pays, qui est votre meilleur argument quand elle existe et votre "
    "pire faute quand vous l'inventez.",
    "<b>Les obligations déclaratives</b> liées à vos ventes à l'étranger, dont la déclaration d'échanges "
    "de services et ses seuils.",
    "<b>Votre couverture d'assurance hors d'Italie.</b> Beaucoup de polices limitent la garantie "
    "territoriale. À faire écrire avant la première mission étrangère.",
])

s += [Spacer(1, 10),
      para("Sources : Betriebsverfassungsgesetz et jurisprudence de la Cour fédérale du travail ; Wet op de "
           "ondernemingsraden, article 27 ; Statuto dei Lavoratori, article 4, et loi italienne du "
           "23 septembre 2025 ; code du travail français et jurisprudence 2025-2026 ; Estatuto de los "
           "Trabajadores, article 64.4 d, issu de la loi 12/2021 ; décisions d'adéquation de la Commission "
           "européenne, renouvellement britannique de décembre 2025 ; règlement européen sur l'IA et son "
           "règlement modificatif de juillet 2026. État au 21 septembre 2026.", "foot")]

build("junior/pdf/AI-bert-Services-Europe.pdf",
      "Vendre en Europe",
      "Ce qui bloque un projet d'IA, pays par pays, et comment on vend le déblocage",
      s, "Services à l'échelle européenne · document interne")
print("PDF Europe généré")
