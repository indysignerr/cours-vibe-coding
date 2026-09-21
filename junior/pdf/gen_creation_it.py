# -*- coding: utf-8 -*-
"""PDF — Créer la structure junior à Milan. Source : junior/FORMALITES-IT.md."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _style import *  # noqa
from reportlab.lib.units import mm

W = CONTENT_W
s = []

s += [para("Ce document est un mode d'emploi, pas un conseil juridique. Il rassemble l'état du droit "
           "italien au 21 septembre 2026, les formulaires, les délais et les seuils. Les points signalés "
           "en rouge doivent être validés par un « dottore commercialista » et un « consulente del "
           "lavoro » avant la première facture. Vous aurez besoin des deux.", "muted")]

# ---------------------------------------------------------------- 1
s += section("1. L'arbitrage France ou Italie, tranché") + [
    para("Une analyse séduisante consiste à constituer en France pour garder le régime social français "
         "de rémunération des étudiants et la franchise de TVA, puis à opérer depuis Milan. "
         "<b>Elle ne tient pas</b>, pour deux raisons.", "body"),
    para("Le règlement européen de coordination des régimes de sécurité sociale rattache une personne au "
         "régime du pays <b>où elle exerce son activité</b>, et non à celui où l'employeur est établi. "
         "Des étudiants travaillant physiquement à Milan basculeraient vers le régime italien de toute "
         "façon, ce qui annule le seul avantage recherché. S'y ajoute un risque d'établissement stable : "
         "une structure française réellement pilotée depuis Milan est difficile à défendre.", "body"),
]
s += [callout("Constituez en Italie.",
              "Vous perdez deux avantages réels, chiffrés ci-dessous, et vous gagnez la cohérence avec la "
              "réalité de votre activité, une constitution plus rapide, et un marché nettement plus porteur. "
              "La décision doit être prise les yeux ouverts, pas par défaut.", "done")]
s += [table([
    ["", "France", "Italie"],
    ["<b>Rémunération des étudiants</b>", "Régime dédié, assiette forfaitaire à 48,08 € la journée, "
     "l'association n'est pas employeur", "<b>Aucun régime dédié.</b> Droit commun, plafond de fait "
     "5 000 € par an et par étudiant"],
    ["<b>Franchise de TVA</b>", "37 500 € pour les services", "<b>Quasi inexistante</b> pour une "
     "association. 22 % dès le premier euro"],
    ["<b>Constitution</b>", "Gratuite, publication gratuite", "250 à 350 € de taxes"],
    ["<b>Délai</b>", "Quelques jours à trois semaines", "Une à deux semaines"],
    ["<b>Responsabilité des dirigeants</b>", "Limitée en principe", "<b>Personnelle et solidaire</b> "
     "pour qui agit au nom de l'association"],
    ["<b>Facturation électronique</b>", "Émission obligatoire en septembre 2027", "<b>Déjà obligatoire "
     "pour tous depuis 2024</b>"],
    ["<b>Friction chez le client</b>", "Consultation du comité social et économique", "<b>Plus forte, "
     "donc plus vendeuse.</b> Voir section 7"],
], [40*mm, (W-40*mm)/2, (W-40*mm)/2])]

# ---------------------------------------------------------------- 2
s += section("2. La forme juridique") + [
    para("« Associazione non riconosciuta », articles 36 à 38 du code civil italien. C'est la forme de la "
         "quasi-totalité des structures junior italiennes, et c'est la bonne pour vous. Trois documents : "
         "l'« atto costitutivo », le « statuto » qui lui est hiérarchiquement supérieur, et des "
         "« regolamenti » pour l'opérationnel.", "body"),
]
s += [table([
    ["Formalité", "Détail"],
    ["Enregistrement", "Agenzia delle Entrate, « modello 69 »"],
    ["Imposta di registro", "<b>200 €</b>, payée par F24"],
    ["Marca da bollo", "<b>16 € par 100 lignes</b>, sur deux exemplaires"],
    ["Délai", "Quelques jours à deux semaines"],
    ["Coût total réaliste", "<b>250 à 350 €</b> de taxes, plus 300 à 800 € si les statuts sont rédigés "
     "par un professionnel"],
], [45*mm, W-45*mm])]
s += [Spacer(1, 8),
      para("L'enregistrement n'est pas obligatoire pour l'existence de l'association, mais sans lui les "
           "banques, les clients et l'administration fiscale vous bloquent.", "muted")]
s += [callout("Le piège de l'article 38 du code civil",
              "Pour les obligations contractées au nom de l'association répondent le fonds commun <b>et, "
              "personnellement et solidairement, les personnes qui ont agi au nom et pour le compte de "
              "l'association</b>. La responsabilité ne tient pas au fait d'avoir la représentation légale, "
              "mais à l'activité concrètement exercée. Si l'association signe une mission à 15 000 € et rate "
              "la livraison, c'est le patrimoine personnel du signataire qui répond.", "accent")]
s += [para("Trois parades, à mettre en place avant la première signature", "h2")]
s += bullets([
    "Une assurance responsabilité civile professionnelle, voir la section 8.",
    "Un <b>plafond de responsabilité contractuel indexé sur le montant de la mission</b>, dans vos "
    "conditions générales.",
    "Des règles de mandat écrites dans les statuts, pour que le nombre de personnes exposées reste minimal.",
])
s += [Spacer(1, 6),
      para("La forme « riconosciuta », qui supprime cette responsabilité personnelle, exige <b>15 000 € de "
           "patrimoine liquide</b> plus des frais notariés. Hors de portée au démarrage, à reconsidérer en "
           "année trois.", "body")]
s += [para("Ce que la voie du Terzo Settore n'autorise pas", "h2"),
      para("Un organisme du Terzo Settore doit exercer principalement une activité d'intérêt général "
           "figurant sur une liste limitative. <b>Le conseil aux entreprises n'y est pas.</b> La formation "
           "visée est celle qui lutte contre le décrochage scolaire, et les services à d'autres organismes "
           "du secteur ne couvrent pas les entreprises commerciales. Cette voie vous est fermée, et c'est "
           "une bonne nouvelle : elle vous aurait coûté sept membres fondateurs permanents et soixante jours "
           "d'instruction.", "body")]

# ---------------------------------------------------------------- 3
s += section("3. Codice fiscale et partita IVA")
s += [table([
    ["Étape", "Formulaire", "Délai", "Coût"],
    ["Codice fiscale", "« modello AA5/6 »", "à la constitution", "gratuit"],
    ["Partita IVA", "« modello AA7/10 »", "<b>30 jours</b> après le début d'activité", "gratuit"],
], [38*mm, 42*mm, 45*mm, W-125*mm])]
s += [Spacer(1, 8),
      para("La partita IVA devient obligatoire dès la première mission facturée : vendre du conseil de "
           "manière répétée est une activité commerciale, sans discussion possible.", "body")]
s += [callout("Cochez la case VIES au dépôt du modello AA7/10.",
              "Sans inscription au VIES, vous ne pouvez pas facturer en autoliquidation à un client "
              "professionnel d'un autre pays de l'Union, ce qui est précisément votre cible internationale. "
              "Et le code d'activité « ATECO » a été renuméroté au 1<super>er</super> janvier 2025 : faites "
              "confirmer le code exact par votre commercialista au moment du dépôt.", "streak")]

# ---------------------------------------------------------------- 4
s += section("4. Fiscalité") + [
    para("Vous êtes un « ente non commerciale » tant que l'activité commerciale ne devient pas prévalente. "
         "Le forfait applicable est celui de l'article 145 du texte unique des impôts sur les revenus : le "
         "revenu imposable s'obtient en appliquant aux recettes un coefficient de <b>15 % jusqu'à "
         "15 493,71 €</b>, puis <b>25 %</b> au-delà.", "body"),
    para("Sur 30 000 € facturés, la base imposable est d'environ 7 500 €, et l'impôt sur les sociétés à "
         "24 % revient à <b>1 800 €</b>. S'y ajoute l'impôt régional sur les activités productives, à "
         "<b>3,9 %</b> en Lombardie.", "body"),
]
s += [callout("Deux mauvaises nouvelles fiscales",
              "<b>La loi 398 de 1991 ne s'applique plus.</b> Le régime forfaitaire favorable a été fermé aux "
              "associations non sportives au 1<super>er</super> janvier 2026. Toute documentation qui dit le "
              "contraire est périmée.<br/><br/>"
              "<b>Il n'existe pratiquement pas de franchise de TVA pour une association.</b> Le régime "
              "forfaitaire italien à 85 000 € est réservé aux personnes physiques. Hypothèse de travail "
              "prudente : vous facturez avec 22 % de TVA dès le premier euro. Sans conséquence pour un "
              "client professionnel qui la récupère, mais avec de l'administratif. C'est la première "
              "question à poser à votre commercialista.", "accent")]
s += [para("Le risque à surveiller", "h2"),
      para("L'article 149 du texte unique fait perdre la qualification d'organisme non commercial à celui "
           "qui exerce principalement une activité commerciale pendant une période d'imposition entière. "
           "Les structures junior italiennes vivent avec ce risque en gardant un volume modeste et une "
           "<b>activité institutionnelle visible et documentée</b> : formation interne, événements, "
           "recrutement. Faites un point à six mois.", "body")]

# ---------------------------------------------------------------- 5
s += section("5. Rémunérer les étudiants, le point critique") + [
    para("<b>Il n'existe aucun équivalent italien du régime français.</b> Aucun texte ne crée de statut "
         "social dérogatoire pour l'étudiant d'une structure junior. Vous entrez dans le droit commun.", "body"),
]
s += [table([
    ["Voie", "Plafond", "Coût social", "Requalification", "Verdict"],
    ["<b>Prestation occasionnelle</b>", "<b>5 000 € par an</b>, tous donneurs d'ordre confondus",
     "Nul sous le seuil. Au-delà, deux tiers de 35,03 % à votre charge", "Faible si les missions sont "
     "vraiment ponctuelles", "<b>Année 1</b>"],
    ["Collaboration coordonnée", "aucun", "Environ +23 % du brut versé", "<b>Élevé</b>", "Année 2"],
    ["Bourse d'étude", "—", "—", "<b>Très élevé</b>", "Jamais"],
    ["Remboursement de frais réels", "frais justifiés", "nul", "nul", "En complément"],
], [37*mm, 30*mm, 38*mm, 30*mm, W-135*mm])]
s += [Spacer(1, 8), para("Trois pièges de la prestation occasionnelle", "h2")]
s += bullets([
    "Le seuil de 5 000 € s'apprécie en <b>additionnant tout ce que l'étudiant perçoit de tous ses donneurs "
    "d'ordre</b> sur l'année civile, pas par contrat. Un étudiant qui a un autre travail occasionnel peut le "
    "franchir sans que votre relation l'atteigne.",
    "Une <b>communication préalable à l'inspection du travail</b> pourrait être exigée avant chaque mission, "
    "sous peine de 500 à 2 500 € par travailleur. À faire confirmer : la sanction est automatique.",
    "<b>La bourse d'étude est le scénario de requalification le plus évident du dossier.</b> Une association "
    "privée qui verse une bourse à l'étudiant qui vient de livrer une mission payante : ne faites pas ça.",
])
s += [Spacer(1, 6),
      para("<b>Concrètement.</b> À deux fondateurs, vous pouvez vous verser environ 10 000 € par an au total "
           "sans complexité sociale. Ce n'est pas rien pour des étudiants, mais ça borne le modèle : au-delà, "
           "il faut passer en collaboration coordonnée et accepter 23 % de charges.", "body")]
s += [callout("L'action la plus rentable de tout ce dossier",
              "Écrivez au réseau Junior Enterprises Italy et à JEME Bocconi, qui est à Milan depuis 1988, "
              "avec une seule question vraiment importante : comment rémunèrent-ils concrètement leurs "
              "membres. Aucune documentation publique n'existe sur ce point, et ils ont résolu le problème "
              "avant vous.", "done")]

# ---------------------------------------------------------------- 6
s += section("6. Le réseau et le nom") + [
    para("Trente-trois structures junior et quatre en création en Italie, plus de deux mille membres. "
         "La confédération a son siège à Milan. Le parcours va de « Gruppo » à « Junior Initiative » avec "
         "le parrainage d'une structure établie, puis au statut plein par vote de l'assemblée. Le modèle "
         "européen annonce <b>six mois à une année académique</b>, une équipe d'au moins cinq cofondateurs "
         "recommandée, et <b>au moins un projet client livré</b> comme preuve de viabilité.", "body"),
]
s += [callout("Deux questions à poser avant de vous engager, et une règle",
              "Albert School, école privée, satisfait-elle le critère d'établissement d'enseignement "
              "supérieur ? Et un campus milanais d'une école dont le siège est en France relève-t-il de la "
              "confédération italienne ou française ? Votre cas est limite.<br/><br/>"
              "La règle : <b>n'employez pas « Junior Enterprise » dans votre nom ni dans votre communication "
              "tant que vous n'êtes pas reconnus.</b> Prenez un nom propre. Et ne bloquez pas votre activité "
              "en attendant le label : vous pouvez facturer dès que vous avez la partita IVA.", "streak")]

# ---------------------------------------------------------------- 7
s += section("7. Votre meilleur argument commercial") + [
    para("L'Italie est <b>plus contraignante que la France</b> sur le déploiement d'IA au travail. Pour un "
         "vendeur de conseil, c'est une excellente nouvelle : la friction réglementaire est un besoin "
         "solvable.", "body"),
    para("L'article 4 du « Statuto dei Lavoratori »", "h2"),
    para("Les instruments dont peut découler <b>une possibilité de contrôle à distance de l'activité des "
         "salariés</b> ne peuvent être installés qu'après <b>accord collectif avec les représentants "
         "syndicaux</b>, ou à défaut <b>autorisation de l'inspection du travail</b>. La violation est "
         "<b>pénalement sanctionnée</b>, et les preuves obtenues sont inutilisables.", "body"),
]
s += [callout("La frontière n'est pas l'outil, c'est la fonctionnalité. Et c'est là qu'est votre valeur.",
              "Les outils de travail ordinaires, ordinateur, téléphone, badgeuse, sont exclus de la "
              "procédure. Mais un logiciel de relation client est un outil de travail, tandis que le même "
              "augmenté d'un score de productivité par commercial redevient un instrument de contrôle et "
              "rebascule sous obligation d'accord.<br/><br/>"
              "Tombent dans le piège : un copilote qui journalise les invites par salarié, une analyse des "
              "appels du support, un agent qui mesure le temps de traitement par ticket, un tri de "
              "candidatures qui trace les évaluateurs.", "accent")]
s += [para("Deux textes de plus", "h2"),
      para("Le <b>décret transparence</b> impose d'informer le salarié et ses représentants syndicaux de "
           "l'usage de systèmes décisionnels ou de surveillance automatisés, en couvrant la logique de "
           "fonctionnement, les catégories de données et <b>les paramètres utilisés pour entraîner le "
           "système</b>. Sanctions de l'ordre de 400 à 1 500 € par mois de violation.", "body"),
      para("Et surtout, <b>l'Italie est le premier État membre de l'Union à s'être doté d'une loi nationale "
           "sur l'IA</b>, en vigueur depuis le 10 octobre 2025. Elle impose de communiquer quels systèmes "
           "sont utilisés, leurs finalités, leur logique et leurs limites, de former les salariés, et de "
           "garantir qu'un humain puisse toujours corriger, suspendre ou arrêter le système.", "body"),
      para("Le régulateur, enfin, est le plus offensif d'Europe sur l'IA : plus de <b>37 millions d'euros</b> "
           "de sanctions en 2025. Une sanction de quinze millions contre un grand fournisseur a toutefois été "
           "suspendue par le tribunal de Rome : ne la présentez pas comme définitive.", "body")]
s += [callout("L'offre que ça crée : « IA conforme au poste de travail », 3 000 €",
              "Qualification de l'outil au regard de l'article 4, préparation de l'accord syndical ou du "
              "dossier d'autorisation, note d'information au titre du décret transparence, note sur le "
              "contrôle humain au titre de la loi de 2025, registre de sous-traitant, contrat de "
              "sous-traitance, support de formation des salariés.<br/><br/>"
              "Le concurrent typique, un indépendant qui branche un agent sur les données du personnel, "
              "ignore ces trois textes. <b>Vous vendez le déblocage réglementaire, et vous livrez "
              "l'automatisation avec.</b>", "done")]

# ---------------------------------------------------------------- 8
s += section("8. Facturation, assurance, données") + [
    para("Facturation électronique", "h2"),
    para("<b>Obligatoire pour tous les titulaires de partita IVA depuis le 1<super>er</super> janvier 2024</b>, "
         "sans seuil ni exonération. Format XML, transmission par le système d'échange de l'administration "
         "fiscale, <b>douze jours</b> pour une facture immédiate. Prévoyez un logiciel et un code "
         "destinataire dès l'ouverture de la partita IVA.", "body"),
    para("Vendre à l'étranger", "h2"),
    para("Client professionnel dans un autre pays de l'Union : facture <b>sans TVA italienne</b>, mention "
         "d'autoliquidation, le client la déclare chez lui. Hors Union : opération hors champ. "
         "<b>Vérifiez systématiquement le numéro de TVA du client sur le VIES avant d'émettre</b> et gardez "
         "la copie d'écran : un numéro invalide rend l'opération interne et la TVA devient votre problème.", "body"),
]
s += [callout("L'obligation que tout le monde oublie",
              "Pour vos <b>achats</b> à l'étranger, abonnements à des outils américains ou européens, vous "
              "devez émettre un document d'intégration électronique, le type TD17 pour les services, au plus "
              "tard le 15 du mois suivant. Une structure qui consomme dix outils en ligne doit produire un "
              "TD17 par fournisseur et par mois. Automatisez-le dès le départ, et faites-en votre première "
              "étude de cas : c'est exactement le genre de mission que vous allez vendre.", "streak")]
s += [para("Délais de paiement", "h2"),
      para("Trente jours à défaut d'accord écrit. Intérêts moratoires au taux de la Banque centrale "
           "européenne majoré de huit points, soit <b>10,15 %</b> au premier semestre 2026, exigibles de "
           "plein droit sans mise en demeure. Indemnité forfaitaire de recouvrement de <b>40 €</b>. "
           "Avec la responsabilité personnelle de l'article 38, un impayé de 10 000 € n'est pas un incident "
           "de trésorerie : <b>acompte de 30 à 50 % à la commande, sans exception</b>.", "body"),
      para("Assurance", "h2"),
      para("Pas obligatoire pour une activité de conseil non réglementée. Souscrivez-la quand même : "
           "l'article 38 expose votre patrimoine, vous touchez aux données et aux systèmes des clients, et "
           "les clients d'une certaine taille l'exigent au référencement. Comptez <b>600 à 1 500 € par an</b> "
           "pour un plafond de 500 000 € à un million avec extension données. Trois devis.", "body")]
s += [callout("Quatre points à faire écrire noir sur blanc dans la police",
              "La garantie subséquente, parce que les étudiants partent et les réclamations arrivent après. "
              "Les <b>dommages immatériels purs</b>, qui sont votre risque principal. L'extension "
              "<b>violation de données personnelles</b>. Et la <b>couverture des intervenants non "
              "salariés</b>, puisque vos étudiants seront en prestation occasionnelle et non en contrat de "
              "travail.", "accent")]
s += [para("Protection des données", "h2"),
      para("Vous êtes sous-traitant dans la quasi-totalité de vos missions. Contrat de sous-traitance "
           "obligatoire avec chaque client, et <b>votre propre registre</b> des activités menées pour le "
           "compte de chacun. Pas de délégué à la protection des données obligatoire pour vous, mais "
           "plusieurs de vos clients en auront un, et il sera votre interlocuteur le plus exigeant.", "body")]

# ---------------------------------------------------------------- 9
s += section("9. À faire, dans cet ordre")
s += [para("Phase 0 · avant toute dépense · quatre semaines", "h2")]
s += [table([
    ["#", "Étape", "Délai"],
    ["1", "Écrire au réseau Junior Enterprises Italy et à JEME Bocconi. Trois questions : éligibilité "
     "d'Albert School, cotisation, <b>et comment ils rémunèrent leurs membres</b>", "1 semaine"],
    ["2", "Rendez-vous avec un commercialista milanais. Questions fermées : franchise de TVA accessible ou "
     "non, forfait de l'article 145, risque de l'article 149, code d'activité", "2 semaines"],
    ["3", "Rendez-vous avec un consulente del lavoro sur la seule rémunération, dont la communication "
     "préalable à l'inspection", "en parallèle"],
    ["4", "<b>Accord écrit d'Albert School Milano</b> : nom, domiciliation, locaux. Sans ce papier, rien "
     "ne part", "2 à 4 semaines"],
], [8*mm, W-38*mm, 30*mm])]
s += [Spacer(1, 8), para("Phase 1 · constitution · trois semaines", "h2")]
s += [table([
    ["#", "Étape", "Délai"],
    ["5", "Rédiger l'acte constitutif et les statuts, avec l'objet incluant les prestations aux tiers, la "
     "non-distribution des bénéfices, et <b>les règles de mandat qui encadrent l'article 38</b>", "1 semaine"],
    ["6", "Assemblée constitutive, cinq fondateurs minimum", "1 jour"],
    ["7", "Enregistrement à l'Agenzia delle Entrate", "1 à 2 semaines"],
    ["8", "Codice fiscale", "simultané"],
    ["9", "Adresse électronique certifiée, identité numérique, signature électronique, compte bancaire",
     "1 à 2 semaines"],
], [8*mm, W-38*mm, 30*mm])]
s += [Spacer(1, 8), para("Phase 2 · mise en ordre de marche · janvier 2027", "h2")]
s += [table([
    ["#", "Étape", "Délai"],
    ["10", "Partita IVA, <b>case VIES cochée</b>", "1 jour"],
    ["11", "Logiciel de facturation électronique et code destinataire", "1 semaine"],
    ["12", "Assurance responsabilité civile professionnelle", "2 semaines"],
    ["13", "Socle RGPD : registre, contrat de sous-traitance type, politique de confidentialité", "1 semaine"],
    ["14", "Conditions générales : acompte, délai de paiement, intérêts, <b>plafond de responsabilité</b>, "
     "propriété intellectuelle", "1 semaine"],
    ["15", "Processus TD17 mensuel sur vos achats à l'étranger, automatisé", "3 jours"],
], [8*mm, W-38*mm, 30*mm])]
s += [Spacer(1, 8),
      para("<b>Phase 3 · marché · février à juin 2027.</b> Une première mission pilote, exigée par le réseau "
           "comme preuve de viabilité et nécessaire comme référence. L'offre « IA conforme au poste de "
           "travail ». Le parcours d'adhésion, sans bloquer l'activité. Et un point fiscal à six mois.", "body")]

s += [Spacer(1, 10),
      para("Ce qui n'a pas pu être vérifié", "h2"),
      para("Le montant de la cotisation au réseau. L'éligibilité d'Albert School et la compétence "
           "territoriale entre confédération italienne et française. La protection exacte de la marque en "
           "Italie. La pratique réelle de rémunération des structures italiennes. L'applicabilité de la "
           "communication préalable à l'inspection du travail. L'accès d'une association italienne à une "
           "franchise de TVA en Italie même, qui est la question fiscale la plus importante du dossier. "
           "Le code d'activité exact. Les montants des sanctions pénales de l'article 4.", "muted"),
      para("Sources : Agenzia delle Entrate, code civil italien, texte unique des impôts sur les revenus, "
           "INPS, Garante per la protezione dei dati personali, Statuto dei Lavoratori, loi n° 132 du "
           "23 septembre 2025, réseau Junior Enterprises Italy et Junior Enterprises Europe. "
           "État au 21 septembre 2026.", "foot")]

build("junior/pdf/AI-bert-Creer-la-structure-Milan.pdf",
      "Créer la structure junior à Milan",
      "Formalités italiennes, délais et pièges, de l'acte constitutif à la première facture",
      s, "Créer la structure junior à Milan · document de travail, pas un conseil juridique")
print("PDF Italie généré")
