# Les Journées de Bordeaux — aperçu d’inscription

Prototype français responsive en HTML, CSS et JavaScript natifs. Aucune dépendance, compilation, base de données, API ou variable d’environnement. Les polices et la photographie sont servies localement.

## Aperçu local

Depuis la racine du projet :

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory public
```

Ouvrir http://localhost:4173.

## Vercel

Importer ce dossier dans un projet Vercel : préréglage **Other**, aucune commande d’installation ni de compilation, dossier de sortie **public**. `vercel.json` contient la configuration. Seul `public/` est publié ; les captures de référence et les tests ne le sont pas.

## Parcours

1. Identité du participant, organisation, e-mail et copie facultative.
2. Dix tarifs de référence, justificatif pour le tarif réduit, code DU, dates pour les formules d’un ou deux jours, déjeuners, préférences alimentaires, gala à 75 € et menu conditionnel.
3. Actualités facultatives et prise de connaissance obligatoire concernant les photos/vidéos.
4. Récapitulatif calculé, facturation personnelle ou professionnelle, carte/virement simulés et acceptation des conditions de démonstration.
5. Confirmation personnalisée, billet récapitulatif, export de calendrier et impression.

Les valeurs sont conservées uniquement dans l’onglet. Recharger ou recommencer efface le formulaire. Aucun téléchargement de justificatif vers un serveur, e-mail, paiement ou enregistrement réel. Un bandeau identifie le prototype. Les liens de contact ouvrent simplement le logiciel de messagerie.

## Choix à confirmer avant un éventuel usage réel

Les références mélangent 32e/33e édition et 2026/2027. Ce prototype suit le bandeau : **32es Journées, 25–27 mars 2026**. Le gala est placé le jeudi **26 mars** pour garder la cohérence du calendrier. Les alternatives de menu non lisibles dans les références sont des exemples. Les CGV définitives, le traitement des justificatifs, les tarifs et les instructions bancaires doivent être fournis par l’organisateur pour une version réelle.

## Vérification

```sh
node --check public/app.js
node tests/pricing.cjs
```

Contrôle des dix tarifs avec/sans gala, sélections invalides et échappement HTML. Vérification dans Chromium : parcours complet payant et gratuit, retour avec conservation des valeurs, e-mail invalide, type de justificatif, sélection d’un/deux jours, autorisation photo, CGV, facturation personnelle, total de 525 €, téléchargement du calendrier et réduction des mouvements. Les cinq écrans ont été contrôlés à 320, 390, 768, 1024 et 1440 px : aucun débordement horizontal. Aucune erreur JavaScript relevée. Captures sous `output/playwright/` (non publié). Safari et Firefox n’ont pas été testés.

## Fichiers

- `public/index.html` : contenu français, formulaire, confirmation.
- `public/styles.css` : identité visuelle, mobile, animations, impression, réduction des mouvements.
- `public/app.js` : navigation, validation, conditions, total, récapitulatif et agenda.
- `public/assets/` : photographie et polices locales.
- `vercel.json` : publication statique sans compilation.
- `tests/pricing.cjs` : vérification exécutable sans dépendance.

## Sources graphiques

- Polices : [DM Sans](https://fonts.google.com/specimen/DM+Sans) et [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), distribuées sous SIL Open Font License. Licences dans `public/assets/`.
- Photographie du pont de Pierre : [Decathlon Outdoor](https://www.decathlon-outdoor.com/fr-fr/explore/france/domaine-de-la-burthe-et-detente-dans-un-coin-de-nature-5f3e32b1728b4), utilisée comme visuel de démonstration ; licence de réutilisation non vérifiée. Remplacer par un visuel autorisé avant usage commercial.
- Signature typographique et symbole d’arches créés pour ce prototype ; ils ne constituent pas les logos officiels de l’événement ou de l’Adera.
