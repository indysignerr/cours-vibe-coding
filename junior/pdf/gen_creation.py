# -*- coding: utf-8 -*-
"""PDF 1 — Créer la structure junior. Source : junior/FORMALITES.md."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _style import *  # noqa
from reportlab.lib.units import mm

W = CONTENT_W
s = []

s += [para("Ce document est un mode d'emploi, pas un conseil juridique. Il rassemble l'état du droit "
           "au 19 septembre 2026, les formulaires exacts, les délais et les seuils. Les points signalés "
           "en rouge doivent être validés par un professionnel avant la première facture.", "muted")]

# ---------------------------------------------------------------- 1
s += section("1. Le fait qui commande tout le reste") + [
      para("Le régime social des junior-entreprises est inscrit dans la loi, pas dans le label.", "body"),
      para("L'article <b>L311-3, 38° du code de la sécurité sociale</b>, créé par la loi de financement "
           "de la sécurité sociale pour 2023, affilie au régime général « les élèves et les étudiants de "
           "l'enseignement supérieur réalisant ou participant à la réalisation, moyennant rémunération, "
           "d'études à caractère pédagogique au sein d'une association constituée exclusivement à cette fin ».", "body"),
      para("Quatre conditions, et pas une de plus : étudiants du supérieur, rémunération, études à "
           "caractère pédagogique, association constituée <b>exclusivement</b> à cette fin. "
           "Le label de la Confédération nationale des Junior-Entreprises n'est pas une condition de droit.", "body")]
s += [callout("Conséquence : le chemin critique n'est pas la confédération, c'est le SIRET puis le rescrit URSSAF.",
              "Vous pouvez rémunérer des étudiants en janvier sans être labellisés. Mais aucune position publiée "
              "de l'URSSAF ne confirme que le label est facultatif, et en cas de contrôle c'est à vous de prouver "
              "le caractère pédagogique et l'objet exclusif. Demandez un rescrit social, et ne rémunérez personne "
              "avant la réponse.", "accent")]

# ---------------------------------------------------------------- 2
s += section("2. Créer l'association") + [
      para("Déclaration au greffe des associations de la préfecture du siège, ou en ligne par le "
           "téléservice e-Création sur service-public.fr.", "body")]
s += [table([
    ["Pièce", "Référence", "Précision"],
    ["Déclaration de création", "Cerfa 13973*04", "Inutile si vous déclarez en ligne"],
    ["Liste des dirigeants", "Cerfa 13971*03", "Nom, profession, domicile, fonction"],
    ["Procès-verbal de l'AG constitutive", "libre", "Daté et signé"],
    ["Statuts", "libre", "Signés par au moins deux administrateurs"],
], [55*mm, 35*mm, W-90*mm])]
s += [Spacer(1, 8),
      para("<b>Récépissé sous 5 jours</b> pour un dossier complet. Il porte le numéro RNA, en W suivi de "
           "neuf chiffres, indispensable pour toutes les démarches suivantes. La <b>publication au Journal "
           "officiel est gratuite et automatique</b>, 8 à 10 jours après, parution le mardi.", "body"),
      para("Ce que les statuts doivent contenir", "h2"),
      para("La loi de 1901 n'impose que le nom, l'objet et le siège. En pratique il faut aussi la durée, "
           "l'admission et la radiation des membres, la composition et les pouvoirs des organes, la "
           "modification des statuts, la dissolution et la dévolution de l'actif.", "body")]
s += [callout("Deux phrases qui décident de tout le reste", None, "accent")]
s += bullets([
    "<b>L'objet doit être formulé exclusivement</b> comme la réalisation d'études à caractère pédagogique "
    "par les étudiants. C'est la condition de l'article L311-3 38°. Un objet mixte qui mélange pédagogie et "
    "prestations commerciales fait tomber le régime social.",
    "<b>Gestion désintéressée explicite</b>, dirigeants bénévoles. C'est la première marche du test fiscal.",
])
s += [Spacer(1, 6),
      para("Tout ce qui bouge souvent, cotisations, tarifs, noms des dirigeants, va dans le <b>règlement "
           "intérieur</b>. C'est là que vivront le processus de sélection des membres, la grille tarifaire "
           "et la répartition des rémunérations d'étude.", "body")]

# ---------------------------------------------------------------- 3
s += section("3. Le SIRET") + [
      para("Obligatoire dès que vous facturez. L'immatriculation n'est jamais automatique pour une "
           "association. Elle le devient si l'association demande une subvention, emploie du personnel, "
           "ou exerce une activité soumise à la TVA ou à l'impôt sur les sociétés. Vendre des prestations "
           "à des entreprises relève du troisième cas.", "body")]
s += [table([
    ["Question", "Réponse"],
    ["Quel guichet ?", "Le service des impôts des entreprises du siège, qui transmet à l'INSEE. "
     "<b>Le guichet unique de l'INPI ne vous concerne pas</b>, il traite les entreprises."],
    ["Quel formulaire ?", "M0 ASSO, Cerfa 15909*02, avec le récépissé ou l'extrait du Journal officiel."],
    ["Quel délai ?", "Non publié par l'INSEE. Comptez plusieurs semaines et prévoyez large."],
    ["Et le code d'activité ?", "Attribué par l'INSEE d'après l'activité déclarée. Vous ne le choisissez pas."],
], [38*mm, W-38*mm])]
s += [Spacer(1, 8),
      para("Profitez du contact avec le service des impôts pour poser deux questions par écrit : votre "
           "éligibilité à la franchise des impôts commerciaux, et le périmètre de la facturation "
           "électronique pour une association en franchise.", "muted")]

# ---------------------------------------------------------------- 4
s += section("4. Fiscalité") + [
      para("Le test de non-lucrativité se fait en trois temps : gestion désintéressée, puis concurrence "
           "au secteur commercial, puis <b>règle des 4P</b> si concurrence il y a, pour Produit, Public, "
           "Prix et Publicité, par ordre d'importance décroissante.", "body")]
s += [callout("C'est votre point de fragilité fiscale",
              "Une structure qui vend du conseil à des entreprises coche « produit concurrentiel » et "
              "« public d'entreprises ». Vos deux arguments réels sont le caractère pédagogique et un prix "
              "nettement inférieur au marché. Aucune doctrine officielle n'exempte les junior-entreprises "
              "de cette analyse. Si votre prévisionnel approche le seuil ci-dessous, demandez un rescrit fiscal.",
              "accent")]
s += [table([
    ["Seuil", "Montant", "Ce qu'il couvre"],
    ["Franchise des impôts commerciaux", "<b>81 051 €</b> de recettes lucratives accessoires",
     "Impôt sur les sociétés, TVA et contribution économique territoriale d'un coup. "
     "S'apprécie par année civile."],
    ["Franchise en base de TVA, services", "<b>37 500 €</b>, majoré 41 250 €",
     "Le filet suivant si la franchise associative tombe. Le projet de seuil unique à 25 000 € "
     "a été abandonné fin 2025."],
], [45*mm, 42*mm, W-87*mm])]
s += [Spacer(1, 8),
      para("En franchise, la facture porte la mention « TVA non applicable, art. 293 B du CGI » et la TVA "
           "d'amont n'est pas déductible.", "muted")]

# ---------------------------------------------------------------- 5
s += section("5. Rémunérer les étudiants")
s += [table([
    ["Point", "Règle"],
    ["Statut", "L'association <b>n'est pas employeur</b>. Pas de contrat de travail, pas de bulletin de paie."],
    ["Cotisations dues", "Maladie, vieillesse, accidents du travail, allocations familiales, CSG et CRDS."],
    ["Cotisations non dues", "Retraite complémentaire, chômage, formation professionnelle, versement "
     "mobilité, dialogue social, FNAL, contribution solidarité autonomie."],
    ["Assiette", "Quatre fois le SMIC horaire du 1<super>er</super> janvier, <b>par journée d'étude rémunérée</b>. "
     "Soit 48,08 € par journée en 2026, à recalculer au 1<super>er</super> janvier 2027."],
    ["Code risque AT", "91.3EA. CSG et CRDS sans l'abattement de 1,75 %."],
], [38*mm, W-38*mm])]
s += [Spacer(1, 8), para("Les autres voies, et leur risque", "h2")]
s += [table([
    ["Voie", "Risque principal"],
    ["Article L311-3 38°", "Contestation du caractère pédagogique ou de l'objet exclusif, "
     "requalification en employeur."],
    ["Auto-entrepreneur", "La présomption de non-salariat est <b>simple</b> : elle tombe si un lien de "
     "subordination est caractérisé. La qualification choisie par les parties ne compte pas."],
    ["Bénévolat", "Toute contrepartie déguisée reconstitue un salaire."],
    ["Contrat de travail", "Juridiquement sûr, économiquement incompatible avec le modèle."],
], [42*mm, W-42*mm])]
s += [Spacer(1, 8),
      para("Une requalification, c'est un redressement sur assiette réelle avec majorations, des rappels "
           "de salaire aux prud'hommes, et la qualification pénale de travail dissimulé.", "muted")]

# ---------------------------------------------------------------- 6
s += section("6. Le parcours de la confédération") + [
      para("Dix étapes validées une à une sur la plateforme d'intégration : éligibilité, exigences "
           "déontologiques, création de l'association, immatriculation, compte bancaire, organigramme "
           "conforme, <b>soutien de l'établissement</b>, offre de prestations, prévisionnel financier, "
           "situation fiscale et sociale à jour.", "body")]
s += [table([
    ["Étape", "Durée", "Ce qu'elle exige"],
    ["Junior Création", "1 à 2 ans", "Visite qualité des auditeurs, exigences d'organisation et de trésorerie."],
    ["Junior Initiative", "1 à 2 ans", "Chiffre d'affaires, nombre d'études signées, organisation renforcée."],
    ["Junior-Entreprise", "annuel", "Le label plein, renouvelé par audit-conseil chaque année."],
], [38*mm, 24*mm, W-62*mm])]
s += [Spacer(1, 8)]
s += [callout("Ce que le label apporte, et ce qu'il n'apporte pas",
              "Il apporte la certification nationale, le réseau, un chargé de mission avec des modèles de "
              "documents, et le droit d'usage de la marque. Il n'apporte pas le régime social, qui tient à "
              "la loi. Albert School entre dans le périmètre des établissements éligibles.", "done")]

# ---------------------------------------------------------------- 7
s += section("7. Le nom") + [
      para("« Junior-Entreprise » est une <b>marque déposée</b> de la confédération, comme Junior-Création, "
           "Junior-Initiative, Junior-Entrepreneur et J.E.", "body")]
s += [table([
    ["Ce que vous pouvez écrire", "Ce que vous ne pouvez pas écrire"],
    ["Association étudiante de conseil<br/>Structure étudiante de prestations intellectuelles<br/>"
     "Cabinet de conseil étudiant<br/><br/>Et, une fois le dossier <b>effectivement déposé</b> : "
     "« en cours d'intégration au Mouvement des Junior-Entreprises », qui est factuel et vérifiable.",
     "Junior-Entreprise, Junior Création, JE<br/>Un nom construit sur ces éléments<br/>"
     "Toute mention laissant entendre une affiliation<br/><br/>« Junior Conseil » est répandu chez les "
     "structures labellisées : le risque de confusion le rend imprudent tant que vous n'êtes pas dans le réseau."],
], [W/2, W/2])]
s += [Spacer(1, 8),
      para("Faites une recherche d'antériorité sur data.inpi.fr avant d'arrêter le nom. C'est gratuit et "
           "immédiat.", "muted")]

# ---------------------------------------------------------------- 8
s += section("8. Assurance, contrats, données") + [
      para("Assurance", "h2"),
      para("<b>Pas d'obligation légale</b> pour une activité de conseil, mais indispensable en pratique : "
           "les écoles l'exigent, les clients d'une certaine taille aussi. Ordre de grandeur pour une petite "
           "structure : 150 à 700 € par an. Faites trois devis.", "body")]
s += [callout("Trois exclusions à faire vérifier explicitement",
              "Pour une activité d'implémentation d'IA : l'atteinte aux données du client, la violation de "
              "droits de tiers sur du code ou un modèle, et les dommages immatériels non consécutifs. "
              "Elles varient entièrement selon la police.", "streak")]
s += [para("Factures et délais", "h2")]
s += [table([
    ["Point", "Règle"],
    ["Délai de paiement", "30 jours à défaut de stipulation, 60 jours maximum depuis l'émission, "
     "ou 45 jours fin de mois si c'est expressément stipulé."],
    ["Pénalités de retard", "Exigibles <b>de plein droit dès le lendemain de l'échéance</b>, sans mise en "
     "demeure. Taux par défaut au second semestre 2026 : <b>12,40 %</b>. Plancher si vous fixez le taux "
     "vous-même : 8,25 %."],
    ["Indemnité de recouvrement", "<b>40 € par facture</b> en retard, à faire figurer sur la facture et "
     "dans les conditions générales."],
    ["Facturation électronique", "Réception obligatoire <b>depuis le 1<super>er</super> septembre 2026</b>. "
     "Émission obligatoire pour les PME au 1<super>er</super> septembre 2027, soit huit mois après votre lancement."],
], [42*mm, W-42*mm])]
s += [Spacer(1, 8), para("Propriété intellectuelle : le piège de votre structure", "h2"),
      para("L'article L131-3 du code de la propriété intellectuelle exige que <b>chaque droit cédé fasse "
           "l'objet d'une mention distincte</b>, avec son étendue, sa destination, son lieu et sa durée. "
           "Les cessions s'interprètent strictement.", "body")]
s += [callout("La dévolution automatique des droits sur un logiciel ne joue que pour un salarié. Vos étudiants n'en sont pas.",
              "Il vous faut une chaîne de cession écrite en deux maillons : de l'étudiant vers l'association "
              "dans le récapitulatif de mission, puis de l'association vers le client dans la convention "
              "d'étude. Sans le premier maillon, vous cédez des droits que vous ne détenez pas. Pensez aussi "
              "à réserver vos briques réutilisables sous licence d'usage plutôt qu'en cession, sinon vous "
              "les perdez à chaque mission.", "accent")]
s += [para("Données personnelles", "h2"),
      para("Vous êtes <b>sous-traitant au sens de l'article 28</b> dès que vous traitez des données "
           "personnelles pour le compte du client. C'est le cas dominant en mission d'implémentation d'IA. "
           "Le contrat doit être écrit et préciser objet, durée, nature, finalité, type de données et "
           "catégories de personnes, plus huit obligations à votre charge, dont l'autorisation écrite pour "
           "tout sous-traitant ultérieur : <b>un fournisseur de modèle en est un</b>.", "body"),
      para("La CNIL publie des clauses contractuelles types utilisables telles quelles. Le registre des "
           "traitements est obligatoire quelle que soit la taille : la CNIL considère elle-même que "
           "l'exemption des structures de moins de 250 salariés a une portée très limitée.", "body")]

# ---------------------------------------------------------------- 9
s += section("9. À faire, dans cet ordre")
rows = [["#", "Étape", "Délai", "Quand"],
        ["1", "Ouvrir un compte sur la plateforme d'intégration, récupérer le chargé de mission et les modèles", "1 jour", "fin sept."],
        ["2", "<b>Accord de principe de la direction d'Albert School.</b> Le plus lent, donc le premier", "3 à 8 semaines", "oct. – nov."],
        ["3", "Recherche d'antériorité de marque, arrêt du nom", "1 jour", "début oct."],
        ["4", "Statuts à objet exclusif et règlement intérieur", "1 à 2 semaines", "oct."],
        ["5", "Assemblée générale constitutive et déclaration en ligne", "2 semaines", "mi-oct."],
        ["6", "Compte bancaire associatif", "2 à 4 semaines", "fin oct."],
        ["7", "SIRET par le service des impôts, formulaire M0 ASSO", "3 à 8 semaines", "nov."],
        ["8", "<b>Rescrit social URSSAF.</b> Ne rémunérez personne avant la réponse", "environ 3 mois", "nov. → févr."],
        ["9", "Responsabilité civile professionnelle, trois devis", "1 à 2 semaines", "nov."],
        ["10", "Kit contractuel, dont la cession de droits de l'étudiant vers l'association", "2 à 3 semaines", "nov. – déc."],
        ["11", "Organigramme conforme et prévisionnel financier", "3 à 4 semaines", "déc."],
        ["12", "Dépôt du dossier d'intégration, puis label Junior Création", "dépôt déc. – janv.", "janv. 2027"],
        ["13", "<b>Première mission.</b> Pas avant SIRET, assurance active, convention école et kit contractuel", "—", "janv. 2027"]]
s += [table(rows, [8*mm, W-58*mm, 27*mm, 23*mm])]

s += [Spacer(1, 12),
      para("Ce qui n'a pas pu être vérifié", "h2"),
      para("Le montant de la cotisation à la confédération. Une position écrite de l'URSSAF sur le caractère "
           "facultatif du label. Le délai officiel d'attribution du SIRET. Les enregistrements de marque "
           "actuellement en vigueur. Le périmètre de la facturation électronique pour une association en "
           "franchise. Les taux d'impôt sur les sociétés et l'exonération de contribution économique "
           "territoriale la première année. Le tarif d'assurance spécifique à une association étudiante de "
           "conseil. Un modèle-type de convention école publié par la confédération.", "muted"),
      para("Sources : service-public.fr, associations.gouv.fr, Légifrance, bulletin officiel des finances "
           "publiques, urssaf.fr, cnil.fr, economie.gouv.fr, plateforme d'intégration de la CNJE. "
           "État au 19 septembre 2026.", "foot")]

build("junior/pdf/AI-bert-Creer-la-structure-junior.pdf",
      "Créer la structure junior",
      "Formalités, délais et pièges, de l'assemblée constitutive à la première facture",
      s, "Créer la structure junior · document de travail, pas un conseil juridique")
print("PDF 1 généré")
